
//import { motion } from 'motion/react';
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Clock, Users, Monitor, Wifi, GraduationCap, CreditCard, Star, Sparkles, Brain, Paintbrush, Presentation, Globe, BookOpen, Laptop2, Video, Award, Target, Lightbulb, Zap } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

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
    { title: "Что такое ИИ и промпт", description: "Дети узнают, где использ  ется ИИ и как он понимает команды.", benefit: "Понимание основ, чтобы не бояться технологий.", icon: Brain },
    { title: "Домашка с ИИ — с умом", description: "Учимся использовать ИИ как помощника, а не решебник.", benefit: "Ребёнок станет эффективнее и самостоятельнее.", icon: Sparkles },
    { title: "Ролевые промпты", description: "ИИ в роли учителя, пирата или мультиперсонажа.", benefit: "Развитие воображения и умение проверять ответы.", icon: Users },
    { title: "Как улучшать результат", description: "Учимся «докручивать» ответы ИИ пошагово.", benefit: "Умение добиваться точного результата.", icon: Target },
    { title: "Шаблоны промптов", description: "Создаём свои заготовки для однотипных задач.", benefit: "Экономия времени и системное мышление.", icon: BookOpen },
    { title: "Работа с картинками", description: "Генерация картинок, редактирование, стикеры, персонажи и истории.", benefit: "Дети развивают креативность и визуальное мышление.", icon: Paintbrush },
    { title: "Презентации с ИИ", description: "Как за 5 минут сделать презентацию по теме.", benefit: "Лёгкая подготовка к школе и конкурсам.", icon: Presentation },
    { title: "Инфографика", description: "Учимся представлять сложное в картинках и схемах.", benefit: "Развитие структурного мышления.", icon: Lightbulb },
    { title: "Защита проекта", description: "Ребёнок учится выступать уверенно и интересно.", benefit: "Полезный навык для школы и будущих выступлений.", icon: Award },
    { title: "Создание сайтов", description: "Делаем сайт-визитку и многостраничный сайт.", benefit: "Практический опыт в цифровых профессиях.", icon: Globe }
  ];

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
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl"
                >
                  🎯 Записаться сейчас
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
            className="grid md:grid-cols-2 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Первая группа</h3>
                  <p className="text-xl text-purple-200">4–5 класс</p>
                </div>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20 hover:border-pink-400/40 transition-colors">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Вторая группа</h3>
                  <p className="text-xl text-pink-200">6–8 класс</p>
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
              const Icon = module.icon;
              return (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="p-6 h-full bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-base font-medium text-purple-300">Урок {index + 1}</span>
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
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">✨ Уникальность курса</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-center h-full hover:border-blue-400/50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-200 text-lg leading-relaxed">Дети научатся пользоваться ИИ с умом, а не для списывания</p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 text-center h-full hover:border-green-400/50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-200 text-lg leading-relaxed">Станут увереннее в учёбе и смогут улучшить свои результаты</p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 text-center h-full hover:border-orange-400/50 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-200 text-lg leading-relaxed">Освоят навыки будущего: работа с текстами, картинками, презентациями, сайтами</p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {}
            <motion.div {...fadeInUp}>
              <Card className="p-8 bg-slate-800/50 border-slate-700 h-full">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Laptop2 className="w-8 h-8 text-purple-400" />
                  Что потребуется
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-200">Стационарный компьютер или ноутбук</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-200">Интернет и Zoom</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {}
            <motion.div {...fadeInUp}>
              <Card className="p-8 bg-slate-800/50 border-slate-700 h-full">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-purple-400" />
                  Расписание
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-200">Четверг, 15:00 (МСК) — группа 4–5 класс</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-200">Пятница, 15:30 (МСК) — группа 6–8 класс</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {}
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
                <div className="mt-3 flex justify-center">
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                    Экономия 1600 руб
                  </Badge>
                </div>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 text-center">
                <CreditCard className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Абоне  ент на месяц</h3>
                <p className="text-gray-300 mb-4">Из расчета 1000 руб за урок</p>
                <p className="text-3xl font-bold text-pink-300">4000 руб</p>
                <div className="mt-3 flex justify-center">
                  <Badge className="mt-3 bg-pink-500/20 text-pink-200 border-pink-400/30">
                    4 урока в месяц
                  </Badge>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="px-4 py-20 bg-gradient-to-b from-transparent to-slate-800/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">👩‍🏫 Об авторе курса</h2>
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
                  педагог с 5-летним опытом в IT-образовании. Автор курсов по искусственному интеллекту для учителей; за последние два года обучила более 500 педагогов внедрять ИИ в учебный процесс
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
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-12 py-6 text-lg font-bold rounded-2xl shadow-2xl"
              >
                🚀 Записаться на курс
              </Button>
            </motion.div>
            
            <p className="text-sm text-gray-400">
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
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

