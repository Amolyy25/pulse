import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BADGES = [
  { slug: "first_checkin", name: "Premier pas", description: "Effectue ton tout premier check-in.", icon: "🌱", rarity: "common", condition_type: "first_checkin", condition_value: 1 },
  { slug: "streak_3", name: "En route", description: "Maintiens un streak de 3 jours sur une habitude.", icon: "🔥", rarity: "common", condition_type: "streak_N", condition_value: 3 },
  { slug: "streak_7", name: "Une semaine !", description: "Maintiens un streak de 7 jours.", icon: "⚡", rarity: "rare", condition_type: "streak_N", condition_value: 7 },
  { slug: "streak_30", name: "Inarrêtable", description: "Maintiens un streak de 30 jours.", icon: "💫", rarity: "epic", condition_type: "streak_N", condition_value: 30 },
  { slug: "streak_100", name: "Légende", description: "Maintiens un streak de 100 jours.", icon: "👑", rarity: "legendary", condition_type: "streak_N", condition_value: 100 },
  { slug: "total_10", name: "10 check-ins", description: "Cumule 10 check-ins au total.", icon: "✅", rarity: "common", condition_type: "total_checkins_N", condition_value: 10 },
  { slug: "total_50", name: "50 check-ins", description: "Cumule 50 check-ins au total.", icon: "🏅", rarity: "rare", condition_type: "total_checkins_N", condition_value: 50 },
  { slug: "total_100", name: "Centurion", description: "Cumule 100 check-ins au total.", icon: "🏆", rarity: "epic", condition_type: "total_checkins_N", condition_value: 100 },
  { slug: "level_5", name: "Niveau 5", description: "Atteins le niveau 5.", icon: "⭐", rarity: "rare", condition_type: "level_N", condition_value: 5 },
  { slug: "level_10", name: "Niveau 10", description: "Atteins le niveau 10.", icon: "🌟", rarity: "epic", condition_type: "level_N", condition_value: 10 },
  { slug: "mood_7", name: "En phase", description: "Enregistre ton humeur 7 fois.", icon: "😊", rarity: "common", condition_type: "mood_logged_N", condition_value: 7 },
  { slug: "journal_7", name: "Écrivain", description: "Écris 7 entrées de journal.", icon: "📓", rarity: "rare", condition_type: "journal_written_N", condition_value: 7 },
];

async function main() {
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        icon: b.icon,
        rarity: b.rarity,
        condition_type: b.condition_type,
        condition_value: b.condition_value,
      },
      create: b,
    });
  }
  console.log(`Seeded ${BADGES.length} badges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
