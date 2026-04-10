import { db } from "../src/db";
import { spots, amenities } from "../src/db/schema";
import { sql } from "drizzle-orm";

const mockLocations = [
  { id: '1', name: 'Язовир Беглика (Родопи)', type: 'wild', latitude: 41.815, longitude: 24.125, description: 'Легендарно място за диво къмпингуване в Родопите. Чист въздух, борова гора и тишина. Пътят е черен, но проходим за бусове.', region: 'Родопи', average_rating: 4.9, reviews_count: 85, status: 'approved', amenities: { water: true, shade: true, flat_ground: false, cell_signal: true, fire_pit: true, pet_friendly: true } },
  { id: '2', name: 'Залив Болата (Черно Море)', type: 'wild', latitude: 43.382, longitude: 28.471, description: 'Един от най-красивите заливи в света. Паркирането е ограничено, но гледката си заслужава. Перфектно за изгреви.', region: 'Добрич', average_rating: 4.7, reviews_count: 56, status: 'approved', amenities: { water: false, shade: false, flat_ground: true, cell_signal: true, fire_pit: false, pet_friendly: true } },
  { id: '3', name: 'Узана - Географски център', type: 'wild', latitude: 42.766, longitude: 25.234, description: 'Обширни пасища и гори в Стара Планина. Много места за свободно паркиране и прекрасни маршрути.', region: 'Габрово', average_rating: 4.6, reviews_count: 32, status: 'approved', amenities: { water: true, shade: true, flat_ground: true, cell_signal: false, fire_pit: true, pet_friendly: true } },
  { id: '4', name: 'Синеморец - Устие на Велека', type: 'wild', latitude: 42.063, longitude: 27.973, description: 'Уникално място, където реката се влива в морето. Пясъчни коси и дюни. Бъдете внимателни с пясъка!', region: 'Бургас', average_rating: 4.8, reviews_count: 91, status: 'approved', amenities: { water: false, shade: true, flat_ground: true, cell_signal: true, fire_pit: false, pet_friendly: true } },
  { id: '5', name: 'Къмпинг "Айляк Резорт"', type: 'host', latitude: 42.235, longitude: 27.525, description: 'Бутиково място за кемпери с всички удобства. Гледка към Странджа планина и близо до морето.', region: 'Бургас', average_rating: 5.0, reviews_count: 12, status: 'approved', amenities: { water: true, shade: true, flat_ground: true, cell_signal: true, fire_pit: true, pet_friendly: true, toilet: true, electricity: true, wifi: true } },
  { id: '6', name: "Седемте рилски езера", description: "Най-популярният планински маршрут в България. Верига от езера с ледников произход в Рила.", latitude: 42.2033, longitude: 23.3150, type: 'wild', region: 'Рила', average_rating: 4.9, reviews_count: 1240, status: 'approved', image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800', amenities: { water: true, cell_signal: true, pet_friendly: true, shade: false } },
  { id: '7', name: "Белоградчишки скали", description: "Уникални скални образувания с богата история. Идеално за разходки и фотография.", latitude: 43.6214, longitude: 22.6747, type: 'wild', region: 'Северозападна България', average_rating: 4.8, reviews_count: 850, status: 'approved', image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800', amenities: { shade: true, cell_signal: true, pet_friendly: true } },
  { id: '8', name: "Хижа Рай", description: "Намира се в подножието на Райското пръскало. Едно от най-красивите места в Стара Планина.", latitude: 42.7042, longitude: 24.9647, type: 'host', region: 'Стара Планина', average_rating: 4.9, reviews_count: 420, status: 'approved', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', amenities: { water: true, electricity: true, fire_pit: true, pet_friendly: true } },
  { id: '9', name: "Крушунски водопади", description: "Магическа поредица от водопади и басейни в района на Летница.", latitude: 43.2458, longitude: 25.0353, type: 'wild', region: 'Дунавска равнина', average_rating: 4.7, reviews_count: 670, status: 'approved', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800', amenities: { shade: true, water: true, cell_signal: true } },
  { id: '10', name: "Чудните мостове", description: "Скален феномен в Родопите, състоящ се от огромни мраморни арки.", latitude: 41.8189, longitude: 24.5808, type: 'wild', region: 'Родопи', average_rating: 4.8, reviews_count: 310, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: true, cell_signal: false, pet_friendly: true } },
  { id: '11', name: "Връх Мусала", description: "Най-високият връх на Балканския полуостров (2925м).", latitude: 42.1792, longitude: 23.5852, type: 'wild', region: 'Рила', average_rating: 4.9, reviews_count: 560, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { cell_signal: true, pet_friendly: true } },
  { id: '12', name: "Мелнишки пирамиди", description: "Пясъчни пирамиди около Мелник.", latitude: 41.5236, longitude: 23.3914, type: 'wild', region: 'Пирин', average_rating: 4.7, reviews_count: 280, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: false, cell_signal: true, pet_friendly: true } },
  { id: '13', name: "Връх Вихрен", description: "Гигантът на Пирин (2914м).", latitude: 41.7675, longitude: 23.3986, type: 'wild', region: 'Пирин', average_rating: 4.9, reviews_count: 480, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { cell_signal: true, pet_friendly: false } },
  { id: '14', name: "Екопътека Бяла река", description: "Живописна екопътека в Централен Балкан.", latitude: 42.5086, longitude: 24.9086, type: 'wild', region: 'Стара Планина', average_rating: 4.8, reviews_count: 340, status: 'approved', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800', amenities: { water: true, shade: true, pet_friendly: true } },
  { id: '15', name: "Камен бряг", description: "Мястото на първото Джулай Морнинг.", latitude: 43.4542, longitude: 28.5242, type: 'wild', region: 'Черноморие', average_rating: 4.8, reviews_count: 520, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { shade: false, cell_signal: true, pet_friendly: true } },
  { id: '16', name: "Къмпинг Градина", description: "Знакова лятна дестинация.", latitude: 42.4050, longitude: 27.6530, type: 'host', region: 'Черноморие', average_rating: 4.6, reviews_count: 2100, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { water: true, electricity: true, toilet: true, cell_signal: true, pet_friendly: true } },
  { id: '17', name: "Хижа Мазалат", description: "Често наричана най-добрата хижа в България.", latitude: 42.7686, longitude: 25.1278, type: 'host', region: 'Стара Планина', average_rating: 5.0, reviews_count: 380, status: 'approved', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', amenities: { water: true, electricity: true, shade: true, pet_friendly: true } },
  { id: '18', name: "Язовир Широка Поляна", description: "Рай за диво къмпингуване на 1500м надморска височина.", latitude: 41.7650, longitude: 24.1800, type: 'wild', region: 'Родопи', average_rating: 4.9, reviews_count: 640, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, shade: true, fire_pit: true, pet_friendly: true } },
  { id: '19', name: "Плаж Иракли", description: "Един от последните диви плажове.", latitude: 42.7533, longitude: 27.8767, type: 'wild', region: 'Черноморие', average_rating: 4.9, reviews_count: 820, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { shade: true, water: false, cell_signal: true, pet_friendly: true } },
  { id: '20', name: "Хижа Вихрен (Пирин)", description: "Изходна точка за връх Вихрен.", latitude: 41.7667, longitude: 23.4167, type: 'host', region: 'Пирин', average_rating: 4.7, reviews_count: 1100, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, electricity: true, toilet: true, cell_signal: false } },
  { id: '21', name: "Язовир Доспат (Сърница)", description: "Перфектно къмпингуване край втория по големина язовир.", latitude: 41.7200, longitude: 24.0300, type: 'wild', region: 'Родопи', average_rating: 4.8, reviews_count: 450, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, shade: true, fire_pit: true, pet_friendly: true } },
  { id: '22', name: "Язовир Пчелина (Параклис Св. Йоан)", description: "Емблематичен параклис върху скалата.", latitude: 42.4630, longitude: 22.8460, type: 'wild', region: 'Перник', average_rating: 4.7, reviews_count: 180, status: 'approved', image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800', amenities: { shade: true, cell_signal: true } },
  { id: '23', name: "Язовир Батак (Цигов чарк)", description: "Популярна аутдор дестинация.", latitude: 41.9300, longitude: 24.1500, type: 'wild', region: 'Родопи', average_rating: 4.6, reviews_count: 920, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: true, water: true, cell_signal: true, pet_friendly: true } },
  { id: '24', name: "Енчево (Язовир Кърджали)", description: "Зашеметяваща гледка към меандъра.", latitude: 41.6650, longitude: 25.3150, type: 'wild', region: 'Родопи', average_rating: 4.9, reviews_count: 240, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: true, cell_signal: true, pet_friendly: true } },
  { id: '25', name: "Язовир Голям Беглик", description: "Магически и тихи нощи.", latitude: 41.8000, longitude: 24.1400, type: 'wild', region: 'Родопи', average_rating: 4.9, reviews_count: 360, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, shade: true, fire_pit: true, pet_friendly: true } },
  { id: '26', name: "Язовир Студен Кладенец", description: "Най-дивият язовир в Източните Родопи.", latitude: 41.6200, longitude: 25.5500, type: 'wild', region: 'Родопи', average_rating: 4.8, reviews_count: 145, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: true, cell_signal: true, pet_friendly: true } },
  { id: '27', name: "Хижа Скакавица", description: "Най-старата хижа в България.", latitude: 42.2350, longitude: 23.2750, type: 'host', region: 'Рила', average_rating: 4.7, reviews_count: 310, status: 'approved', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', amenities: { water: true, electricity: true, shade: true } },
  { id: '28', name: "Екопътека Струилица", description: "Красива пътека с минерални басейни.", latitude: 41.7450, longitude: 24.3850, type: 'wild', region: 'Родопи', average_rating: 4.9, reviews_count: 520, status: 'approved', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800', amenities: { water: true, shade: true, cell_signal: true } },
  { id: '29', name: "Плаж Карадере", description: "Легендарен див плаж.", latitude: 42.9167, longitude: 27.9000, type: 'wild', region: 'Варна', average_rating: 4.8, reviews_count: 670, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { shade: true, water: false, cell_signal: false, pet_friendly: true } },
  { id: '30', name: "Язовир Жеребчево (Потопената църква)", description: "Уникална история и магнит за фотография.", latitude: 42.6050, longitude: 25.8600, type: 'wild', region: 'Сливен', average_rating: 4.7, reviews_count: 430, status: 'approved', image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800', amenities: { shade: true, cell_signal: true, fire_pit: true } },
  { id: '31', name: "Хижа Козя Стена", description: "Зашеметяващи гледки към Стара планина.", latitude: 42.7567, longitude: 24.5242, type: 'host', region: 'Стара Планина', average_rating: 4.9, reviews_count: 280, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, shade: true, pet_friendly: true } },
  { id: '32', name: "Побити камъни (Варна)", description: "Единствената пустиня в България.", latitude: 43.2272, longitude: 27.7050, type: 'wild', region: 'Варна', average_rating: 4.6, reviews_count: 360, status: 'approved', image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800', amenities: { shade: false, cell_signal: true } },
  { id: '33', name: "Язовир Ивайловград", description: "Най-дългият язовир в България.", latitude: 41.6050, longitude: 26.0500, type: 'wild', region: 'Хасково', average_rating: 4.5, reviews_count: 120, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: true, water: true, pet_friendly: true } },
  { id: '34', name: "Хижа Безбог", description: "До езерото Безбог.", latitude: 41.7289, longitude: 23.5133, type: 'host', region: 'Пирин', average_rating: 4.8, reviews_count: 640, status: 'approved', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', amenities: { water: true, electricity: true, shade: true } },
  { id: '35', name: "Бекови скали (Равногор)", description: "Най-чистият въздух на Балканите.", latitude: 41.9567, longitude: 24.3850, type: 'wild', region: 'Родопи', average_rating: 4.9, reviews_count: 220, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { shade: true, cell_signal: true } },
  { id: '36', name: "Хижа Плевен", description: "Най-добрата панорамна тераса.", latitude: 42.7483, longitude: 24.9125, type: 'host', region: 'Стара Планина', average_rating: 4.8, reviews_count: 512, status: 'approved', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', amenities: { water: true, electricity: true, shade: true, fire_pit: true } },
  { id: '37', name: "Каньон на водопадите (Смолян)", description: "Над 46 водопада.", latitude: 41.5950, longitude: 24.6650, type: 'wild', region: 'Родопи', average_rating: 4.9, reviews_count: 890, status: 'approved', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800', amenities: { water: true, shade: true, cell_signal: true } },
  { id: '38', name: "Хижа Синаница", description: "Красотата на Пирин.", latitude: 41.7250, longitude: 23.3550, type: 'host', region: 'Пирин', average_rating: 5.0, reviews_count: 230, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, electricity: true, shade: false } },
  { id: '39', name: "Нос Емине", description: "Там, където планината среща морето.", latitude: 42.7017, longitude: 27.9000, type: 'wild', region: 'Черноморие', average_rating: 4.7, reviews_count: 640, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { shade: false, cell_signal: true, pet_friendly: true } },
  { id: '40', name: "Еменски каньон", description: "Първата екопътека в България.", latitude: 43.1333, longitude: 25.3533, type: 'wild', region: 'Велико Търново', average_rating: 4.8, reviews_count: 415, status: 'approved', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800', amenities: { water: true, shade: true, cell_signal: true, pet_friendly: true } },
  { id: '41', name: "Атанасовско езеро (Розовото езеро)", description: "Уникална розова лагуна.", latitude: 42.5350, longitude: 27.4680, type: 'wild', region: 'Бургас', average_rating: 4.6, reviews_count: 1250, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { cell_signal: true, pet_friendly: true } },
  { id: '42', name: "Хижа Амбарица", description: "Известна със своите боровинки.", latitude: 42.7567, longitude: 24.7717, type: 'host', region: 'Стара Планина', average_rating: 4.9, reviews_count: 215, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, electricity: true, shade: true } },
  { id: '43', name: "Район Мальовица", description: "Център на алпинизма.", latitude: 42.1700, longitude: 23.3600, type: 'wild', region: 'Рила', average_rating: 4.9, reviews_count: 980, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { water: true, shade: false, cell_signal: true } },
  { id: '44', name: "Чудните скали (яз. Цонево)", description: "Замъци от камък.", latitude: 42.9650, longitude: 27.3150, type: 'wild', region: 'Варна', average_rating: 4.7, reviews_count: 560, status: 'approved', image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800', amenities: { shade: true, cell_signal: true, pet_friendly: true } },
  { id: '45', name: "Стобските пирамиди", description: "Пясъчни пирамиди в Рила.", latitude: 42.0833, longitude: 23.1167, type: 'wild', region: 'Рила', average_rating: 4.6, reviews_count: 320, status: 'approved', image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800', amenities: { shade: false, cell_signal: true, pet_friendly: true } },
  { id: '46', name: "Деветашка пещера", description: "Една от най-големите пещери в Европа.", latitude: 43.2333, longitude: 24.8833, type: 'wild', region: 'Ловеч', average_rating: 4.9, reviews_count: 1450, status: 'approved', image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800', amenities: { shade: true, cell_signal: true } },
  { id: '47', name: "Нос Калиакра", description: "Древен град и крепост.", latitude: 43.3617, longitude: 28.4650, type: 'wild', region: 'Черноморие', average_rating: 4.8, reviews_count: 2200, status: 'approved', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', amenities: { cell_signal: true, pet_friendly: true } },
  { id: '48', name: "Връх Ботев", description: "Най-високият връх в Стара планина.", latitude: 42.7167, longitude: 24.9167, type: 'wild', region: 'Стара Планина', average_rating: 4.9, reviews_count: 580, status: 'approved', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622eb2c3b?q=80&w=800', amenities: { cell_signal: true } },
  { id: '49', name: "Пещера Св. Иван Рилски", description: "Свещено място над Рилския манастир.", latitude: 42.1400, longitude: 23.3600, type: 'wild', region: 'Рила', average_rating: 4.9, reviews_count: 340, status: 'approved', image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800', amenities: { shade: true, water: true } },
  { id: '50', name: "Паметник Бузлуджа", description: "НЛО-то.", latitude: 42.7358, longitude: 25.3358, type: 'wild', region: 'Стара Планина', average_rating: 4.5, reviews_count: 760, status: 'approved', image_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800', amenities: { shade: false, cell_signal: true } }
];

const getLegalInfo = (region: string, name: string) => {
  const r = region.toLowerCase();
  
  if (r.includes("рила") || r.includes("пирин") || r.includes("стара планина") || r.includes("национален парк")) {
    return { legalStatus: "protected" as const, riskLevel: "high" as const };
  }
  if (r.includes("черно море") || r.includes("черноморие") || r.includes("варна") || r.includes("бургас") || r.includes("добрич")) {
    return { legalStatus: "strict" as const, riskLevel: "medium" as const };
  }
  if (r.includes("родопи") || r.includes("странджа") || r.includes("сакар")) {
    return { legalStatus: "tolerated" as const, riskLevel: "low" as const };
  }
  return { legalStatus: "tolerated" as const, riskLevel: "low" as const };
};

async function main() {
  console.log("Seeding started with 2026 Regulations...");

  await db.run(sql`DELETE FROM amenities`);
  await db.run(sql`DELETE FROM spots`);

  for (const loc of mockLocations) {
    console.log(`Inserting: ${loc.name}`);
    const { legalStatus, riskLevel } = getLegalInfo(loc.region, loc.name);

    await db.insert(spots).values({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      latitude: loc.latitude,
      longitude: loc.longitude,
      type: loc.type as "wild" | "host",
      region: loc.region,
      imageUrl: loc.image_url || null,
      averageRating: loc.average_rating || 0,
      reviewsCount: loc.reviews_count || 0,
      status: "approved",
      legalStatus,
      riskLevel,
    });

    if (loc.amenities) {
      await db.insert(amenities).values({
        spotId: loc.id,
        water: !!loc.amenities.water,
        shade: !!loc.amenities.shade,
        flatGround: !!loc.amenities.flat_ground,
        cellSignal: !!loc.amenities.cell_signal,
        firePit: !!loc.amenities.fire_pit,
        petFriendly: !!loc.amenities.pet_friendly,
        toilet: !!loc.amenities.toilet,
        electricity: !!loc.amenities.electricity,
        wifi: !!loc.amenities.wifi,
      });
    }
  }

  console.log("Seeding finished!");
}

main().catch(console.error);
