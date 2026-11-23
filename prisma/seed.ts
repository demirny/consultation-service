import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

const topics = [
  ["Производные и графики", "Математика", "Разберём задачи на производные и построение графиков.", "Аудитория 204"],
  ["Запросы к базе данных", "Информатика", "Практика выборок, объединений и группировки данных.", "Компьютерный класс 312"],
  ["Подготовка к зачёту", "Математика", "Повторим темы зачёта и решим типовые задачи.", "Аудитория 204"],
  ["Структуры данных", "Информатика", "Сравним массивы, списки и словари на примерах.", "Компьютерный класс 312"],
  ["Тригонометрические уравнения", "Математика", "Обсудим основные формулы и способы решения.", "Аудитория 208"],
  ["Проект на TypeScript", "Информатика", "Разберём вопросы по структуре и типизации проекта.", "Компьютерный класс 310"],
];

async function seed() {
  const passwordHash = await hash("123456", 12);
  await prisma.$transaction(async (db) => {
    await db.booking.deleteMany();
    await db.consultation.deleteMany();
    await db.user.deleteMany();

    const teachers = await Promise.all(["Ольга Сергеевна Иванова", "Алексей Викторович Петров"].map((fullName, index) =>
      db.user.create({ data: { email: `teacher${index + 1}@college.ru`, fullName, passwordHash, role: "TEACHER" } }),
    ));
    const students = await Promise.all(["Мария Соколова", "Иван Кузнецов", "Анна Орлова"].map((fullName, index) =>
      db.user.create({ data: { email: `student${index + 1}@college.ru`, fullName, passwordHash, role: "STUDENT", groupName: index === 2 ? "ИС-22" : "ИС-21" } }),
    ));
    const now = new Date();
    const consultations = await Promise.all(topics.map(([title, subject, description, location], index) =>
      db.consultation.create({ data: {
        title, subject, description, location,
        date: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + index + 2)),
        startTime: index % 2 ? "15:30" : "14:00",
        endTime: index % 2 ? "16:15" : "14:45",
        maxStudents: index === 0 ? 2 : 8,
        teacherId: teachers[index % 2].id,
      } }),
    ));

    await db.booking.createMany({ data: [
      { consultationId: consultations[0].id, studentId: students[0].id },
      { consultationId: consultations[0].id, studentId: students[1].id },
      { consultationId: consultations[1].id, studentId: students[2].id },
      { consultationId: consultations[2].id, studentId: students[0].id, status: "CANCELLED" },
    ] });
  });
  console.log("Добавлено 15 учебных записей.");
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
