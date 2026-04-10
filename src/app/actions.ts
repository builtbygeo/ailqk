"use server";

import { db } from "@/db";
import { spots, amenities, reviews } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// ─── Spot Submission ─────────────────────────────────────────────────────────

export async function addSpot(formData: {
  name: string;
  description: string;
  latitude: string | number;
  longitude: string | number;
  type: string;
  region: string;
  imageUrl?: string;
  legalStatus: string;
  riskLevel: string;
  amenities: {
    water?: boolean;
    shade?: boolean;
    flatGround?: boolean;
    cellSignal?: boolean;
    firePit?: boolean;
    petFriendly?: boolean;
    toilet?: boolean;
    electricity?: boolean;
    wifi?: boolean;
  };
}) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Трябва да влезеш в профила си." };
  }

  // Pro gate: host listings require Clerk publicMetadata.isPro
  if (formData.type === "host") {
    const isPro = (user.publicMetadata as { isPro?: boolean })?.isPro;
    if (!isPro) {
      return {
        success: false,
        error: "Само Ailyak Pro потребители могат да добавят домакински места. Надстрой профила си!",
        requiresPro: true,
      };
    }
  }

  // Basic validation
  const lat = parseFloat(String(formData.latitude));
  const lng = parseFloat(String(formData.longitude));

  if (!formData.name?.trim()) return { success: false, error: "Името е задължително." };
  if (!formData.description?.trim()) return { success: false, error: "Описанието е задължително." };
  if (isNaN(lat) || lat < 41 || lat > 44.5) return { success: false, error: "Невалидна географска ширина за България." };
  if (isNaN(lng) || lng < 22 || lng > 29) return { success: false, error: "Невалидна географска дължина за България." };
  if (!formData.region?.trim()) return { success: false, error: "Регионът е задължителен." };

  const validTypes = ["wild", "host"] as const;
  const validLegalStatuses = ["tolerated", "approved", "protected", "strict"] as const;
  const validRiskLevels = ["low", "medium", "high", "extreme"] as const;

  if (!validTypes.includes(formData.type as typeof validTypes[number])) return { success: false, error: "Невалиден тип място." };
  if (!validLegalStatuses.includes(formData.legalStatus as typeof validLegalStatuses[number])) return { success: false, error: "Невалиден правен статус." };
  if (!validRiskLevels.includes(formData.riskLevel as typeof validRiskLevels[number])) return { success: false, error: "Невалидно ниво на риск." };

  const spotId = crypto.randomUUID();

  try {
    await db.insert(spots).values({
      id: spotId,
      name: formData.name.trim(),
      description: formData.description.trim(),
      latitude: lat,
      longitude: lng,
      type: formData.type as "wild" | "host",
      region: formData.region.trim(),
      imageUrl: formData.imageUrl?.trim() || null,
      legalStatus: formData.legalStatus as "tolerated" | "approved" | "protected" | "strict",
      riskLevel: formData.riskLevel as "low" | "medium" | "high" | "extreme",
      status: "pending",
      createdBy: user.id,
    });

    await db.insert(amenities).values({
      spotId,
      water: !!formData.amenities.water,
      shade: !!formData.amenities.shade,
      flatGround: !!formData.amenities.flatGround,
      cellSignal: !!formData.amenities.cellSignal,
      firePit: !!formData.amenities.firePit,
      petFriendly: !!formData.amenities.petFriendly,
      toilet: !!formData.amenities.toilet,
      electricity: !!formData.amenities.electricity,
      wifi: !!formData.amenities.wifi,
    });

    revalidatePath("/map");
    return { success: true, id: spotId };
  } catch (error) {
    console.error("Error adding spot:", error);
    return { success: false, error: "Грешка при запис в базата данни." };
  }
}

// ─── Review Submission ───────────────────────────────────────────────────────

export async function addReview(data: {
  spotId: string;
  rating: number;
  comment: string;
}) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Трябва да влезеш в профила си, за да оставиш отзив." };
  }

  if (!data.spotId) return { success: false, error: "Липсва ID на мястото." };
  if (!data.rating || data.rating < 1 || data.rating > 5) return { success: false, error: "Рейтингът трябва да е от 1 до 5." };
  if (!data.comment?.trim()) return { success: false, error: "Коментарът е задължителен." };

  // Verify spot exists and is approved
  const spot = await db.select().from(spots).where(eq(spots.id, data.spotId)).get();
  if (!spot) return { success: false, error: "Мястото не съществува." };
  if (spot.status !== "approved") return { success: false, error: "Могат да се оставят отзиви само за одобрени места." };

  const reviewId = crypto.randomUUID();

  try {
    await db.insert(reviews).values({
      id: reviewId,
      spotId: data.spotId,
      userId: user.id,
      userName: user.fullName || user.username || "Анонимен",
      rating: data.rating,
      comment: data.comment.trim(),
    });

    // Incremental rating update — avoids full table scan
    const currentReviewsCount = spot.reviewsCount ?? 0;
    const currentAvgRating = spot.averageRating ?? 0;
    const newCount = currentReviewsCount + 1;
    const newAvg = (currentAvgRating * currentReviewsCount + data.rating) / newCount;

    await db.update(spots)
      .set({
        averageRating: Math.round(newAvg * 10) / 10,
        reviewsCount: newCount,
      })
      .where(eq(spots.id, data.spotId));

    revalidatePath(`/spots/${data.spotId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, error: "Грешка при запис на отзива." };
  }
}

// ─── Admin Actions ───────────────────────────────────────────────────────────

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);

function assertAdmin(userId: string) {
  if (!ADMIN_USER_IDS.includes(userId)) {
    throw new Error("Нямаш права за това действие.");
  }
}

export async function approveSpot(spotId: string) {
  const user = await currentUser();
  if (!user) redirect("/profile");
  assertAdmin(user.id);

  await db.update(spots).set({ status: "approved" }).where(eq(spots.id, spotId));
  revalidatePath("/admin/spots");
  revalidatePath("/map");
  return { success: true };
}

export async function rejectSpot(spotId: string) {
  const user = await currentUser();
  if (!user) redirect("/profile");
  assertAdmin(user.id);

  await db.update(spots).set({ status: "rejected" }).where(eq(spots.id, spotId));
  revalidatePath("/admin/spots");
  return { success: true };
}
