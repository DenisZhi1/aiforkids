//import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Clock2, Clock3, Clock4, Clock5, Clock6, Shield, Clock, Users, Monitor, Wifi, GraduationCap, CreditCard, Star, Sparkles, Brain, Paintbrush, Presentation, Globe, BookOpen, Laptop2, Video, Award, Target, Lightbulb, Zap, Clapperboard } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import type { MouseEventHandler } from "react";

import rev1 from "./components/review/rev1.png";
import rev2 from "./components/review/rev2.png";
import rev3 from "./components/review/rev3.png";
import rev4 from "./components/review/rev4.png";
import rev5 from "./components/review/rev5.png";
// локальные фото педагогов
import lubovImg from './components/teachers/lubov.png';
import dinaraImg from './components/teachers/dinara.png';

/*
  Раздел "Отзывы выпускников" добавлен ниже перед секцией "Старт набора уже открыт!".
  Структура массива `reviews` предложена — заполните `src` путями к вашим картинкам в папке `src/components/revews`
  или импортируйте изображения сверху и подставьте переменные в поле `src`.
*/

export default function App() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.8 }
  };

  const staggerChildren = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const courseModules = [
      {
          title: "Что такое ИИ и промпт",
          description: "Дети узнают, где используется ИИ и как он понимает команды человека.",
          benefit: "Базовое понимание технологий без страха и сложных терминов.",
          icon: Brain
      },

      {
          title: "Домашка с ИИ — с умом",
          description: "Учимся использовать ИИ как помощника в учёбе, а не как решебник.",
          benefit: "Ребёнок становится более самостоятельным и эффективным.",
          icon: Sparkles
      },

      {
          title: "Ролевые промпты",
          description: "ИИ в роли учителя, пирата или любимого персонажа.",
          benefit: "Развитие воображения и навыка критически оценивать ответы.",
          icon: Users
      },

      {
          title: "Как улучшать результат",
          description: "Учимся пошагово уточнять запросы и «докручивать» ответы ИИ.",
          benefit: "Навык получать точный и нужный результат.",
          icon: Target
      },

      {
          title: "Шаблоны промптов",
          description: "Создаём собственные заготовки для повторяющихся задач.",
          benefit: "Экономия времени и развитие системного мышления.",
          icon: BookOpen
      },

      {
          title: "Работа с картинками",
          description: "Генерация изображений, редактирование, работы со стилями, персонажи и истории.",
          benefit: "Развитие креативности и визуального мышления.",
          icon: Paintbrush
      },

      {
          title: "Генерация видео",
          description: "Создание видео с озвучкой с помощью ИИ.",
          benefit: "Увлекательный вход в мир видеоконтента и сторителлинга.",
          icon: Clapperboard
      },

      {
          title: "Презентации с ИИ",
          description: "Как за 5 минут создать презентацию по любой теме.",
          benefit: "Быстрая и уверенная подготовка к школе, конкурсам и проектам.",
          icon: Presentation
      },

      {
          title: "Защита проекта",
          description: "Ребёнок учится презентовать свою работу уверенно и понятно.",
          benefit: "Развитие навыков публичных выступлений и самопрезентации.",
          icon: Shield
      },

      {
          title: "Генерация простого сайта с игрой",
          description: "Знакомство с основами вайб-кодинга на базе HTML.",
          benefit: "Развитие логики и структурного мышления.",
          icon: Lightbulb
      },

      {
          title: "Создание сайта-визитки",
          description: "Создаём первый сайт-портфолио ребёнка и размещаем его на хостинге.",
          benefit: "Готовый цифровой проект, которым можно гордиться и делиться.",
          icon: Globe
      }

  ];

// helpers
const isMobile =
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.userAgentData?.mobile ?? false);

const isVKWebView =
  /(VKAndroidApp|VKontakte|VK|com\.vk\.vkclient)/i.test(navigator.userAgent);

// --- новый: структура расписания (удобно поддерживать/изменять) ---
const schedule: {
  day: string;
  time: string;
  tz?: string;
  group: string;
  teacher: string;
  seats: number;
  icon: any;
}[] = [
  { day: 'Вторник', time: '16:30', tz: 'МСК', group: '3–5 класс', teacher: 'Любовь Зарубина', seats: 4, icon: Clock2 },
  { day: 'Четверг', time: '15:00', tz: 'МСК', group: '3–5 класс', teacher: 'Денис Жихарев', seats: 1, icon: Clock3 },
  { day: 'Пятница', time: '15:30', tz: 'МСК', group: '6–9 класс', teacher: 'Денис Жихарев', seats: 3, icon: Clock4 },
  { day: 'Пятница', time: '17:00', tz: 'МСК', group: '3–5 класс', teacher: 'Динара Губайдуллина', seats: 4, icon: Clock5 },
  { day: 'Воскресенье', time: '10:30', tz: 'МСК', group: '3–5 класс', teacher: 'Денис Жихарев', seats: 1, icon: Clock6 },
];

// helper: класс для бейджа мест (меняется при мало/много мест)
const seatsBadgeClass = (n: number) => {
  if (n <= 3) {
    return "bg-red-500/20 text-red-200 border-red-400/30";
  }
  if (n <= 6) {
    return "bg-yellow-500/10 text-yellow-200 border-yellow-400/20";
  }
  return "bg-green-500/10 text-green-200 border-green-400/20";
};
// --- конец новых частей ---

// --- новые: данные педагогов ---
const teachers: {
  name: string;
  photo: string;
  role?: string;
  description: string;
}[] = [
  {
    name: 'Любовь Зарубина',
    photo: lubovImg,
    role: 'Педагог по цифровым навыкам',
    description:
      'Педагог и наставник, с которым занятия по ИИ проходят легко и понятно. Она очень внимательная и доброжелательная, поэтому детям комфортно учиться, пробовать новое и задавать любые вопросы. Любовь помогает превращать идеи в результат: от первых запросов к ИИ до готовых проектов, презентаций и историй. С ней дети постепенно начинают верить в свои силы и не боятся ошибаться.'
  },
  {
    name: 'Динара Губайдуллина',
    photo: dinaraImg,
    role: 'Педагог по программированию',
    description:
      'Педагог, с которой детям спокойно и комфортно учиться работать с ИИ. Она объясняет всё шаг за шагом, без спешки и давления, помогает разобраться в сложных моментах и всегда поддерживает, если что-то не получается. Вместе с Динарой дети увлеченно осваивают ИИ и постепенно начинают чувствовать себя увереннее как в учёбе, так и в проектах.'
  }
        ];


// --- конец данных педагогов ---

// --- новые: структура отзывов (заглушки)
//  - положите картинки отзывов в папку `src/components/revews` (или скорректируйте путь).
//  - рекомендую импортировать изображения сверху вместо строк, если хотите, чтобы Vite корректно упаковал ассеты.
//  - структура: { src: string, name?: string, age?: string }
const reviews = [
  { src: rev1, name: "Айрапет", age: "16" },
  { src: rev2, name: "Дарья", age: "15" },
  { src: rev3, name: "Кеша", age: "15" },
  { src: rev4, name: "Тимофей", age: "9" },
  { src: rev5, name: "Никита", age: "9" },
];
/*  
const reviews: { src: string; name?: string; age?: string }[] = [
    { src: 'src/components/review/rev1.png', name: 'Айрапет', age: '16' },
    { src: './src/components/review/rev2.png', name: 'Дарья', age: '15' },
    { src: './src/components/review/rev3.png', name: 'Кеша', age: '15' },
    { src: './src/components/review/rev4.png', name: 'Тимофей', age: '9' },
    { src: './src/components/review/rev5.png', name: 'Никита', age: '9' }
];
*/
// --- конец отзывов ---

// ссылки
const VK_DESKTOP = "https://vk.com/im?sel=2840329";
const VK_MOBILE  = "https://t.me/D_Z_D_A";
const VK_INAPP   = "https://t.me/D_Z_D_A"; // для WebView ВК
const VK_APP     = "https://t.me/D_Z_D_A";           // дип-линк в приложение

// выбираем href
const vkHref = isVKWebView ? VK_INAPP : (isMobile ? VK_MOBILE : VK_DESKTOP);

// обработчик клика
const handleVKClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
  if (isVKWebView) {
    // Внутри приложения ВК остаёмся на vk.com — откроет нативный экран
    e.preventDefault();
    window.location.href = VK_INAPP;
    return;
  }
  if (isMobile) {
    // Снаружи пробуем открыть приложение ВК, иначе — мобильную веб-версию
    e.preventDefault();
    const t = Date.now();
    window.location.href = VK_APP;
    setTimeout(() => {
      if (Date.now() - t < 1500) {
        window.location.href = VK_MOBILE;
      }
    }, 700);
  }
};

  // carousel state for reviews
  const [currentReview, setCurrentReview] = useState(0);
  useEffect(() => {
    const autoplay = setInterval(() => {
      setCurrentReview((c) => (c + 1) % Math.max(1, reviews.length));
    }, 5000);
    return () => clearInterval(autoplay);
  }, []);

  const prevReview = () => setCurrentReview((c) => (c - 1 + reviews.length) % reviews.length);
  const nextReview = () => setCurrentReview((c) => (c + 1) % reviews.length);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"></div>
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {}
            <motion.div 
              className="space-y-8"
              variants={fadeInLeft}
              initial="initial"
              animate="whileInView"
            >
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-6 py-2">
                🚀 Первый онлайн-курс по ИИ для детей
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
                Курс «ИИ для детей» by DEAL
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Хотите, чтобы ваш ребёнок не просто пользовался ИИ как решебником, а умел применять его с умом и для реальной пользы? 
                Запускаем первый онлайн-курс по искусственному интеллекту для детей от автора курса по ИИ для учителей Дениса Жихарева 
                (с сотнями довольных выпускников и отзывами ⭐).
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >

                <Button 
                  asChild
                  size="lg" 
                  //onClick={() => window.open("https://vk.com/im/convo/2840329", "_blank", "noopener,noreferrer")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl"
                >
                    <a
                      href={vkHref}
                      onClick={handleVKClick}
                      target={isVKWebView ? undefined : (isMobile ? undefined : "_blank")}
                      rel="noopener noreferrer"
                      aria-label="Записаться сейчас"
                    >
                  🎯 Записаться сейчас
                     </a>
                </Button>
              </motion.div>
            </motion.div>

            {}
            <motion.div 
              className="relative"
              variants={fadeInRight}
              initial="initial"
              animate="whileInView"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent z-10"></div>
                <ImageWithFallback
                  src="https://i.postimg.cc/hjyMr2Z7/20221223-125251.jpg"
                  alt="Дети изучают технологии и ИИ"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-white font-medium">🎓 Более 500 довольных учеников на курсах для педагогов </p>
                    <p className="text-purple-200 text-sm">Первые в России курсы ИИ для детей</p>
                  </div>
                </div>
              </div>
              
              {}
              <motion.div 
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">📌 Для кого курс</h2>
          </motion.div>
          
          <motion.div 
            className="max-w-3xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                <div className="text-center space-y-6">
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    Этот курс — для школьников, которые хотят понять, как работает ИИ и научиться использовать его с пользой. Дети учатся «разговаривать» с ИИ, делать домашние задания осознанно, придумывать картинки, видео и презентации, создавать свои первые сайты и игры и уверенно показывать результат. ИИ перестаёт быть магией или решебником и становится понятным инструментом для учёбы, творчества и собственных проектов.
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">📚 Программа курса</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {courseModules.map((module, index) => {

              // рядом, выше разметки
              const groupSizes: Record<number, number> = {
                5: 4,   // 6–10 в 6-й карточке (index 5)
                10: 2,  // 14–15 в 14-й карточке (index 13)
              };
              
              const getLessonLabel = (i: number) => {
                // сколько уроков уже «прошли» до i-й карточки
                let start = 1;
                for (let k = 0; k < i; k++) start += groupSizes[k] ?? 1;
              
                const size = groupSizes[i] ?? 1;
                const end = start + size - 1;
                return size > 1 ? `Уроки ${start}–${end}` : `Урок ${start}`;
              };

              const Icon = module.icon;
             // const lessonLabel = (i: number) =>
             //   i === 5 ? "Уроки 6–10" : `Урок ${i < 5 ? i + 1 : i + 5}`; 
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="p-6 h-full bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <span className="text-base font-medium text-purple-300">
                           {getLessonLabel(index)}
                        </span>  
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-bold text-white">{module.title}</h3>
                      <p className="text-gray-300 text-base leading-relaxed">{module.description}</p>
                      <div className="pt-2 border-t border-slate-600">
                        <p className="text-sm text-purple-200">👉 {module.benefit}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {}
          <motion.div {...fadeInUp} className="mt-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-xl rounded-3xl"></div>
              <Card className="relative p-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-base">
                    🏆 ФИНАЛ КУРСА
                  </Badge>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">Дипломный проект</h3>
                  <p className="text-xl text-gray-200 max-w-2xl mx-auto">Ребёнок создаёт свой полноценный проект с ИИ.</p>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 inline-block">
                    <p className="text-lg text-yellow-200 font-medium">👉 Гордость за результат и уверенность в себе</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-12">
            {}
            <motion.div {...fadeInUp}>
              <Card className="p-6 sm:p-8 bg-slate-800/50 border-slate-700 h-full overflow-hidden">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Laptop2 className="w-6 sm:w-8 h-6 sm:h-8 text-purple-400 flex-shrink-0" />
                  <span>Что потребуется</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-200 break-words">Стационарный компьютер или ноутбук</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-200">Интернет и Zoom</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {}
            <motion.div {...fadeInUp}>
              <Card className="p-6 sm:p-8 bg-slate-800/50 border-slate-700 h-full overflow-hidden">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-purple-400 flex-shrink-0" />
                  <span>Расписание</span>
                </h3>
                <div className="grid md:grid-cols-3 gap-4 md:gap-6 space-y-4 md:space-y-0">
                  {schedule.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div 
                        key={i} 
                        className="flex flex-col gap-3 p-3 sm:p-4 bg-slate-700/30 rounded-lg md:col-span-1"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <span className="text-white font-medium text-sm sm:text-base">
                            {s.day}, {s.time} ({s.tz})
                          </span>
                        </div>
                        
                        <div className="text-gray-200 text-sm sm:text-base">
                          {s.group}
                        </div>
                        
                        <div className="text-xs sm:text-sm text-gray-400">
                          Педагог: <span className="text-purple-200 font-medium">{s.teacher}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Badge className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${seatsBadgeClass(s.seats)} flex-shrink-0`}>
                            {s.seats} {s.seats === 1 ? 'место' : 'места'}
                          </Badge>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex-shrink-0"
                            onClick={() => window.open(vkHref, "_blank")}
                          >
                            Записаться
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">💳 Стоимость</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 text-center">
                <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Разовая оплата</h3>
                <p className="text-gray-300 mb-4">За весь курс (16 уроков)</p>
                <p className="text-3xl font-bold text-purple-300">14 400 руб</p>
                <Badge className="mt-3 bg-purple-500/20 text-purple-200 border-purple-400/30">
                  Экономия 1600 руб
                </Badge>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 text-center">
                <CreditCard className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Абонемент на месяц</h3>
                <p className="text-gray-300 mb-4">Из расчета 1000 руб за урок</p>
                <p className="text-3xl font-bold text-pink-300">5300 руб</p>
                <Badge className="mt-3 bg-pink-500/20 text-pink-200 border-pink-400/30">
                  Выгодно
                </Badge>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* об авторе */}
      <section className="px-4 py-20 bg-gradient-to-b from-transparent to-slate-800/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Об авторе курса</h2>
          </motion.div>
          
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInLeft}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl rounded-full"></div>
                <ImageWithFallback
                  src="https://i.postimg.cc/sgjckdFZ/sqaure.png"
                  alt="Автор курса"
                  className="relative w-80 h-80 lg:w-96 lg:h-96 object-cover rounded-3xl shadow-2xl mx-auto"
                />
              </div>
            </motion.div>
            
            <motion.div variants={fadeInRight} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Денис Жихарев</h3>
                <p className="text-xl text-purple-300">Эксперт по ИИ в образовании</p>
              </div>
              
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  педагог с 5-летним опытом в IT-образовании. Автор курсов по искусственному интеллекту для учителей; за последние два года обучил более 500 педагогов внедрять ИИ в учебный процесс
                </p>
                
                <p>
                  По образованию инженер-программист, преподаю английский и программирование, веду блог для преподавателей DEAL. Регулярно помогаю коллегам прокачивать цифровые компетенции — теперь делюсь этими знаниями с детьми, чтобы они уверенно осваивали технологии будущего.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-purple-500/10 border-purple-500/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-300">500+</p>
                    <p className="text-sm text-gray-300">Выпускников</p>
                  </div>
                </Card>
                
                <Card className="p-4 bg-pink-500/10 border-pink-500/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-300">5.0⭐</p>
                    <p className="text-sm text-gray-300">Рейтинг курсов</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

          { }

          <section className="px-4 py-16">
              <div className="container mx-auto max-w-6xl">
                  <motion.div {...fadeInUp} className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">👩‍🏫 Наши педагоги</h2>
                      <p className="text-gray-400 max-w-2xl mx-auto">Педагоги курса — опытные преподаватели, каждый ведёт свою тему и сопровождает проектную работу детей.</p>
                  </motion.div>

                  <motion.div
                      className="grid md:grid-cols-1 gap-8"
                      variants={staggerChildren}
                      initial="initial"
                      whileInView="whileInView"
                      viewport={{ once: true }}
                  >
                      {teachers.map((t, idx) => (
                          <motion.div key={idx} variants={idx % 2 === 0 ? fadeInLeft : fadeInRight}>
                              <Card className="p-6 bg-slate-800/50 border-slate-700 h-full">
                                  <div className="flex flex-col md:flex-row items-center gap-6">
                                      <ImageWithFallback
                                          src={t.photo}
                                          alt={t.name}
                                          className="w-40 h-40 object-cover rounded-2xl shadow-md"
                                      />
                                      <div className="text-left space-y-2">
                                          <h4 className="text-xl font-bold text-white">{t.name}</h4>
                                          {t.role && <p className="text-sm text-purple-200">{t.role}</p>}
                                          <p className="text-gray-300">{t.description}</p>
                                      </div>
                                  </div>
                              </Card>
                          </motion.div>
                      ))}
                  </motion.div>
              </div>
          </section>

          {/* Новая секция: Отзывы выпускников (карусель) */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeInUp} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">🗣️ Отзывы выпускников</h2>
          </motion.div>

          <motion.div {...fadeInUp} className="relative">
            <div className="bg-slate-800/40 rounded-3xl p-6 flex flex-col items-center">
              <div className="w-full max-w-2xl h-[420px] md:h-[520px] bg-slate-900/30 rounded-xl overflow-hidden flex items-center justify-center">
                <ImageWithFallback
                  src={reviews.length ? reviews[currentReview].src : './components/revews/placeholder.png'}
                  alt={`Отзыв ${currentReview + 1}`}
                  className="w-full h-full"
                  fit="contain"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-white font-medium">{reviews[currentReview].name || 'Имя ученика'}</p>
                <p className="text-sm text-gray-400">{reviews[currentReview].age ? `${reviews[currentReview].age} лет` : 'Возраст'}</p>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <Button size="sm" onClick={prevReview} className="px-3 py-1 rounded-full">◀</Button>

                <div className="flex gap-2">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentReview(idx)}
                      aria-label={`Перейти к отзыву ${idx + 1}`}
                      className={`w-2 h-2 rounded-full ${idx === currentReview ? 'bg-white' : 'bg-slate-600'}`}
                    />
                  ))}
                </div>

                <Button size="sm" onClick={nextReview} className="px-3 py-1 rounded-full">▶</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            {...fadeInUp}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">📢 Старт набора уже открыт!</h2>
              <p className="text-xl text-gray-300">
                Количество мест ограничено, так как группы маленькие и работа идёт в интерактиве.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                onClick={() => window.open("https://vk.com/im/convo/2840329", "_blank", "noopener,noreferrer")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-12 py-6 text-lg font-bold rounded-2xl shadow-2xl"
              >
                🚀 Записаться на курс
              </Button>
            </motion.div>
            
            <p className="text-sm text-gray-400">
              Нажимая кнопку, вы соглашаетесь с апгрейдом своих детей бесповоротно
            </p>
          </motion.div>
        </div>
      </section>

      {}
      <footer className="px-4 py-8 border-t border-slate-700">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gray-400">© 2025 Курс «ИИ для детей». Все права защищены.</p>
        </div>
      </footer>
    </div>


  );
}


















