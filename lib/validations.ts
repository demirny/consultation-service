import { z } from "zod";

export const roles = z.enum(["STUDENT", "TEACHER"], { errorMap: () => ({ message: "Выберите роль." }) });
export const statuses = z.enum(["CONFIRMED", "CANCELLED"], { errorMap: () => ({ message: "Укажите допустимый статус." }) });

const required = (message: string, limit: number) =>
  z.string({ required_error: message, invalid_type_error: message }).trim().min(1, message).max(limit, `Максимум ${limit} символов.`);

export const loginSchema = z.object({
  email: required("Введите электронную почту.", 254).email("Проверьте адрес электронной почты.").toLowerCase(),
  password: z.string({ required_error: "Введите пароль." }).min(6, "Пароль должен содержать минимум 6 символов.")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "Пароль должен занимать не более 72 байт."),
});

export const registerSchema = loginSchema.extend({
  fullName: required("Введите имя и фамилию.", 100),
  role: roles,
  groupName: z.string().trim().max(60, "Название группы должно содержать до 60 символов.").optional(),
});

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Введите дату в формате ГГГГ-ММ-ДД.").refine((value) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Укажите существующую дату.");

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Укажите время в формате ЧЧ:ММ.");
const consultationFields = z.object({
  title: required("Укажите название.", 120),
  description: required("Добавьте описание.", 1200),
  subject: required("Укажите предмет.", 100),
  date,
  startTime: time,
  endTime: time,
  location: required("Укажите место встречи.", 150),
  maxStudents: z.number({ invalid_type_error: "Укажите число мест." }).int("Введите целое число.").min(1, "Минимум одно место.").max(100, "Максимум 100 мест."),
});

const validTime = { message: "Время окончания должно быть позже начала.", path: ["endTime"] };
export const consultationSchema = consultationFields.refine(({ startTime, endTime }) => endTime > startTime, validTime);
export const consultationPatchSchema = consultationFields.partial()
  .refine((data) => Object.keys(data).length > 0, "Укажите поля для изменения.")
  .refine(({ startTime, endTime }) => !startTime || !endTime || endTime > startTime, validTime);

export const bookingSchema = z.object({ consultationId: required("Выберите консультацию.", 64) });
export const bookingStatusSchema = z.object({ status: statuses });
