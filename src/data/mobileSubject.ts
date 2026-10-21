import { Subject } from '../types';

export const mobileSubject: Subject = {
  "id": "rmp",
  "title": "Разработка мобильных приложений",
  "code": "2-40 01 01",
  "subtitle": "Мобильная разработка под Android • 3 курс",
  "department": "Лидский колледж УО «ГрГУ им. Янки Купалы»",
  "teacher": "Селедцов Александр Игоревич",
  "group": "37В",
  "course": 3,
  "totalHours": 50,
  "theoryHours": 30,
  "practiceHours": 20,
  "sections": [
    {
      "id": "sec-rmp-1",
      "romanNum": "Раздел I",
      "title": "Архитектура платформы Android и инструментарий разработки",
      "hours": 8,
      "practiceHours": 2,
      "topicIds": [
        "top-rmp-1"
      ]
    },
    {
      "id": "sec-rmp-2",
      "romanNum": "Раздел II",
      "title": "Жизненный цикл компонентов приложения и Activity",
      "hours": 8,
      "practiceHours": 4,
      "topicIds": [
        "top-rmp-2"
      ]
    },
    {
      "id": "sec-rmp-3",
      "romanNum": "Раздел III",
      "title": "Построение пользовательского интерфейса (UI) и навигация",
      "hours": 16,
      "practiceHours": 6,
      "topicIds": [
        "top-rmp-3",
        "top-rmp-4"
      ]
    },
    {
      "id": "sec-rmp-4",
      "romanNum": "Раздел IV",
      "title": "Хранение данных и сетевое взаимодействие (REST API)",
      "hours": 18,
      "practiceHours": 8,
      "topicIds": [
        "top-rmp-5",
        "top-rmp-6"
      ]
    }
  ],
  "practicalWorks": [
    {
      "id": 1,
      "number": 1,
      "title": "Установка среды Android Studio, настройка эмулятора AVD и запуск проекта",
      "hours": 4,
      "goals": "Освоить создание проекта в Android Studio, структуру каталогов и запуск первого приложения на виртуальном устройстве Pixel.",
      "tasks": [
        "Создать проект с пустой Activity (Empty Views Activity) на языке Kotlin.",
        "Настроить виртуальный образ Android Virtual Device (AVD) с аппаратным ускорением HAXM/WHPX.",
        "Собрать APK-пакет и изучить работу консоли Logcat для вывода отладочных сообщений."
      ],
      "sampleReport": "Скриншоты запущенного эмулятора, листинг файла AndroidManifest.xml и код базовой Activity с логами Log.d()."
    },
    {
      "id": 2,
      "number": 2,
      "title": "Исследование методов жизненного цикла Activity и сохранение состояния при повороте",
      "hours": 4,
      "goals": "Изучить переходы между состояниями Activity и реализовать сохранение введенных данных в объекте Bundle.",
      "tasks": [
        "Переопределить все методы жизненного цикла (onCreate, onStart, onResume, onPause, onStop, onDestroy) с логированием в Logcat.",
        "Смоделировать смену ориентации экрана и проанализировать повторное создание Activity.",
        "Реализовать сохранение значений текстовых полей через onSaveInstanceState() и onRestoreInstanceState()."
      ],
      "sampleReport": "Диаграмма переходов состояний по данным Logcat, исходный код обработчиков сохранения Bundle."
    },
    {
      "id": 3,
      "number": 3,
      "title": "Проектирование адаптивного интерфейса в ConstraintLayout и списков RecyclerView",
      "hours": 4,
      "goals": "Научиться создавать сложные макеты экранов с использованием ограничений и выводить динамические списки через RecyclerView.",
      "tasks": [
        "Сверстать карточку студента в ConstraintLayout с использованием Guidelines и Chains.",
        "Создать класс данных Student, адаптер StudentAdapter и реализацию паттерна ViewHolder.",
        "Настроить отображение списка из 20 студентов с обработкой клика по элементу."
      ],
      "sampleReport": "XML-код макета activity_main.xml и item_student.xml, код адаптера на Kotlin и скриншоты работающего списка."
    },
    {
      "id": 4,
      "number": 4,
      "title": "Организация навигации между экранами с помощью Intent и передача параметров",
      "hours": 4,
      "goals": "Освоить явные интенты для перехода на экран детальной информации и неявные интенты для системных действий.",
      "tasks": [
        "Реализовать передачу ID студента во вторую Activity через Intent.putExtra().",
        "Создать кнопки для открытия веб-сайта в браузере (ACTION_VIEW) и набора номера (ACTION_DIAL).",
        "Реализовать возврат результата выбора из второй Activity с помощью Activity Result API."
      ],
      "sampleReport": "Схема навигационных переходов приложения, листинг запуска интентов и обработки результатов."
    },
    {
      "id": 5,
      "number": 5,
      "title": "Разработка базы данных Room и интеграция с сетевым REST API через Retrofit",
      "hours": 4,
      "goals": "Создать локальное хранилище данных на SQLite с помощью Room и реализовать загрузку данных из сети с корутинами.",
      "tasks": [
        "Объявить сущность @Entity, интерфейс @Dao и базу данных @Database.",
        "Создать интерфейс Retrofit для получения списка учебных курсов с сервера в формате JSON.",
        "Организовать кэширование: отображение данных из Room и фоновое обновление по сети с корутинами."
      ],
      "sampleReport": "Схема базы данных Room, листинг интерфейса Retrofit, скриншоты приложения с отображением сетевых данных."
    }
  ],
  "topics": [
    {
      "id": "top-rmp-1",
      "code": "1.1",
      "title": "Архитектура ОС Android и инструменты разработки",
      "hours": 2,
      "sectionId": "sec-rmp-1",
      "shortDescription": "Стек Android (Linux Kernel, HAL, ART/Dalvik, Java API Framework), среда Android Studio, система сборки Gradle, эмуляторы AVD, файл AndroidManifest.xml.",
      "prerequisites": [],
      "position": { "x": 80, "y": 260 },
      "synopsis": {
        "summary": "Архитектурные слои открытой мобильной операционной системы Android: виртуальная машина ART, среда выполнения байткода DEX, проектная структура Android Studio и декларативный манифест приложения.",
        "keyPoints": [
          "Стек Android: Ядро Linux (драйверы, безопасность), Слой аппаратных абстракций HAL, Native C/C++ библиотеки, Среда выполнения ART (Android Runtime), Фреймворк Java/Kotlin API, Системные и пользовательские приложения.",
          "Среда выполнения ART: использует компиляцию Ahead-Of-Time (AOT) и JIT со сбором профилей (PGO) для прямого исполнения машинного кода ARM.",
          "Файл AndroidManifest.xml: обязательный корневой декларативный дескриптор, объявляющий все компоненты (Activities, Services, Receivers), разрешения (Permissions) и требования к оборудованию.",
          "Система сборки Gradle: управление зависимостями, компиляция исходного кода Kotlin/Java, ресурсов res/ и упаковка в APK / Android App Bundle (AAB)."
        ],
        "content": "### 1. Архитектурные уровни операционной системы Android\n\nAndroid построен на модифицированном ядре Linux и включает пять фундаментальных слоев:\n\n1. **Ядро Linux (Linux Kernel):** отвечает за управление памятью, процессами, энергосбережением и низкоуровневыми драйверами оборудования (камера, дисплей, Wi-Fi, Bluetooth).\n2. **Слой аппаратных абстракций (HAL — Hardware Abstraction Layer):** стандартные интерфейсы для взаимодействия верхних слоев с оборудованием без привязки к конкретным чипсетам.\n3. **Android Runtime (ART) и Native-библиотеки:**\n   * Каждое приложение запускается в собственной изолированной песочнице (Sandbox) со своим уникальным UID Linux.\n   * Виртуальная машина **ART** исполняет компактный регистровый байткод `.dex` (Dalvik Executable). В отличие от старой Dalvik, ART компилирует критические участки приложения в машинный код во время установки и зарядки устройства (AOT/JIT профилирование), устраняя подтормаживания интерфейса.\n4. **Java API Framework:** библиотеки классов Android (`ActivityManager`, `NotificationManager`, `ContentProviders`, `View System`).\n5. **Прикладной уровень (System & User Apps):** приложения пользователя и системные службы (Телефон, Контакты, Браузер).\n\n### 2. Структура проекта в Android Studio\n\n* `app/src/main/java (или kotlin):` исходный код классов и логики приложения.\n* `app/src/main/res/:` внешние ресурсы приложения:\n  * `layout/` — XML-разметка пользовательских экранов.\n  * `drawable/` — векторные (VectorDrawable XML) и растровые изображения.\n  * `values/` — строки локализации (`strings.xml`), цвета (`colors.xml`), темы (`themes.xml`).\n* `AndroidManifest.xml:` паспорт приложения. Любая Activity, не объявленная в манифесте тегом `<activity>`, не может быть запущена системой (вызовет аварийное исключение `ActivityNotFoundException`).",
        "intuitSourceRef": "Курс ИНТУИТ «Разработка мобильных приложений под Android», Лекция 1: Архитектура платформы Android и среда разработки"
      },
      "test": {
        "id": "test-rmp-1",
        "title": "Тест 1.1: Архитектура Android и экосистема",
        "durationMinutes": 15,
        "maxScore": 10,
        "questions": [
          {
            "id": "q-rmp-1-1",
            "question": "Какая операционная система лежит в основе фундаментального нижнего слоя платформы Android?",
            "options": [
              "FreeBSD",
              "Ядро Linux (Linux Kernel)",
              "Windows NT",
              "MS-DOS"
            ],
            "correctIndex": 1,
            "explanation": "Android базируется на модифицированном ядре Linux, используемом для управления аппаратными ресурсами, памятью и безопасностью."
          },
          {
            "id": "q-rmp-1-2",
            "question": "Какая виртуальная машина обеспечивает выполнение байткода приложений в современных версиях Android?",
            "options": [
              "Стандартная Oracle HotSpot JVM",
              "ART (Android Runtime)",
              "V8",
              "CLR"
            ],
            "correctIndex": 1,
            "explanation": "С Android 5.0 основной средой выполнения является ART, сменившая устаревшую виртуальную машину Dalvik."
          },
          {
            "id": "q-rmp-1-3",
            "question": "В каком формате упаковывается скомпилированный байткод классов Android в отличие от традиционных .class файлов Java?",
            "options": [
              ".exe",
              ".dex (Dalvik Executable)",
              ".dll",
              ".iso"
            ],
            "correctIndex": 1,
            "explanation": "Инструмент D8 преобразует байткод Java в компактный оптимизированный формат DEX для регистровой виртуальной машины."
          },
          {
            "id": "q-rmp-1-4",
            "question": "Какой обязательный XML-файл содержит декларацию всех компонентов приложения (Activity, Service) и запрашиваемых разрешений?",
            "options": [
              "build.gradle",
              "AndroidManifest.xml",
              "settings.json",
              "strings.xml"
            ],
            "correctIndex": 1,
            "explanation": "Файл AndroidManifest.xml описывает базовые свойства приложения, его компоненты, точки входа и запрашиваемые системные права."
          },
          {
            "id": "q-rmp-1-5",
            "question": "Какая система автоматизации сборки используется в Android Studio по умолчанию?",
            "options": [
              "Make",
              "Ant",
              "Gradle (на основе скриптов Kotlin DSL / Groovy)",
              "Maven"
            ],
            "correctIndex": 2,
            "explanation": "Gradle является официальной системой сборки проектов под Android, управляющей зависимостями и формированием пакетов APK/AAB."
          },
          {
            "id": "q-rmp-1-6",
            "question": "В какой подпапке каталога res/ размещаются XML-файлы верстки пользовательского интерфейса экранов?",
            "options": [
              "res/values",
              "res/drawable",
              "res/layout",
              "res/mipmap"
            ],
            "correctIndex": 2,
            "explanation": "Все файлы декларативной визуальной разметки экранов и элементов списков помещаются в папку res/layout."
          },
          {
            "id": "q-rmp-1-7",
            "question": "Что представляет собой концепция «песочницы приложения» (Application Sandbox) в Android?",
            "options": [
              "Детская обучающая игра",
              "Выделение каждому установленному приложению уникального идентификатора пользователя Linux (UID), изолирующего его файловую систему и память от других приложений",
              "Режим работы без интернета",
              "Эмулятор экрана"
            ],
            "correctIndex": 1,
            "explanation": "Механизм разграничения прав Linux изолирует приложения: процесс с одним UID не имеет права читать личные файлы процесса с другим UID."
          },
          {
            "id": "q-rmp-1-8",
            "question": "Для чего в манифесте объявляется фильтр интентов с категорией android.intent.category.LAUNCHER?",
            "options": [
              "Для ускорения загрузки процессора",
              "Для указания главной Activity, которая должна отображаться на рабочем столе (лаунчере) и запускаться при нажатии на иконку приложения",
              "Для удаления приложения",
              "Для включения фоновой музыки"
            ],
            "correctIndex": 1,
            "explanation": "Тег `<category android:name='android.intent.category.LAUNCHER'/>` указывает лаунчеру создать иконку запуска для данной Activity."
          },
          {
            "id": "q-rmp-1-9",
            "question": "Какой современный формат публикации приложений в Google Play заменил устаревшие монолитные APK-файлы?",
            "options": [
              ".zip",
              ".tar.gz",
              "AAB (Android App Bundle)",
              ".dmg"
            ],
            "correctIndex": 2,
            "explanation": "Формат AAB содержит все скомпилированные ресурсы, позволяя Google Play генерировать оптимизированный уменьшенный APK под конкретную архитектуру процессора и разрешение экрана пользователя."
          },
          {
            "id": "q-rmp-1-10",
            "question": "Какую функцию выполняет компонент Android SDK Manager в среде Android Studio?",
            "options": [
              "Управляет громкостью динамиков",
              "Загружает и обновляет версии Android API, платформенные инструменты (ADB, Fastboot), компиляторы и образы виртуальных устройств",
              "Редактирует фотографии",
              "Очищает кэш браузера"
            ],
            "correctIndex": 1,
            "explanation": "SDK Manager отвечает за установку и обновление пакетов API платформы, утилит сборки Build Tools и системных образов эмулятора."
          }
        ]
      }
    },
    {
      "id": "top-rmp-2",
      "code": "2.1",
      "title": "Жизненный цикл Activity и Fragment: состояния и управление памятью",
      "hours": 2,
      "sectionId": "sec-rmp-2",
      "shortDescription": "Методы обратного вызова onCreate, onStart, onResume, onPause, onStop, onDestroy, уничтожение при нехватке памяти, сохранение состояния через onSaveInstanceState (Bundle).",
      "prerequisites": ["top-rmp-1"],
      "position": { "x": 440, "y": 160 },
      "synopsis": {
        "summary": "Архитектура управления экранами мобильного приложения: автомат состояний жизненного цикла Activity, реакция на поворот экрана (Configuration Change) и безопасное восстановление пользовательского ввода через SavedInstanceState.",
        "keyPoints": [
          "Activity (Активность): базовый компонент Android, представляющий собой единый визуальный экран с пользовательским интерфейсом.",
          "Цепочка методов создания и отображения: `onCreate()` -> `onStart()` -> `onResume()`.",
          "Состояние Resumed: активность находится на переднем плане, видима и принимает пользовательский ввод (Foreground).",
          "Цепочка скрытия и уничтожения: `onPause()` -> `onStop()` -> `onDestroy()`.",
          "Смена конфигурации (поворот экрана): Activity полностью уничтожается (`onDestroy`) и создается заново (`onCreate`), требуя сохранения состояния во внешнем объекте Bundle."
        ],
        "content": "### 1. Автомат состояний жизненного цикла Activity\n\nВ отличие от десктопных программ с одной точкой входа `main()`, приложение Android управляется операционной системой асинхронно через методы обратного вызова (Callbacks):\n\n```\n          [Запуск Activity]\n                  |\n                  v\n             onCreate()      <--- Первичная инициализация UI, setContentView()\n                  |\n                  v\n             onStart()       <--- Активность становится видимой\n                  |\n                  v\n             onResume()      <--- Активность интерактивна (на переднем плане)\n                  |\n        [Работа с пользователем]\n                  |  (появился звонок / диалог)\n                  v\n             onPause()       <--- Теряет фокус, но частично видима (пауза анимаций)\n                  |  (экран полностью перекрыт)\n                  v\n             onStop()        <--- Активность невидима (освобождение тяжелых ресурсов)\n                  |\n                  +---------------------> [ОС убивает процесс при нехватке памяти]\n                  |                                      |\n                  v                                      v\n            onDestroy()                           onCreate(savedInstanceState)\n```\n\n### 2. Сохранение пользовательского состояния при пересоздании\n\nПри повороте экрана (смене портретной ориентации на альбомную) система принудительно пересоздает Activity для подгрузки альтернативных ресурсов (`layout-land`):\n* Для сохранения введенных пользователем данных переопределяется метод:\n  ```kotlin\n  override fun onSaveInstanceState(outState: Bundle) {\n      super.onSaveInstanceState(outState)\n      outState.putString(\"USER_TEXT\", editText.text.toString())\n  }\n  ```\n* Восстановление данных производится в `onCreate(savedInstanceState: Bundle?)` или в `onRestoreInstanceState()`.\n* В современной архитектуре Android для долговременного хранения данных UI без потерь при поворотах используется компонент **ViewModel** из библиотеки Android Jetpack.",
        "intuitSourceRef": "Курс ИНТУИТ «Разработка мобильных приложений под Android», Лекция 3: Жизненный цикл активности и управление состояниями"
      },
      "test": {
        "id": "test-rmp-2",
        "title": "Тест 2.1: Жизненный цикл Activity и состояния",
        "durationMinutes": 15,
        "maxScore": 10,
        "questions": [
          {
            "id": "q-rmp-2-1",
            "question": "В каком состоянии жизненного цикла Activity находится на переднем плане и непосредственно принимает пользовательский ввод?",
            "options": [
              "Created",
              "Started",
              "Resumed",
              "Stopped"
            ],
            "correctIndex": 2,
            "explanation": "В состоянии Resumed (после выполнения onResume) Activity полностью активна, видима и принимает касания пользователя."
          },
          {
            "id": "q-rmp-2-2",
            "question": "Какой метод вызывается системой первым при инициализации Activity, где обычно вызывают setContentView()?",
            "options": [
              "onStart()",
              "onCreate()",
              "onResume()",
              "onAttach()"
            ],
            "correctIndex": 1,
            "explanation": "Метод onCreate() вызывается при создании экземпляра Activity для инициализации разметки и привязки переменных."
          },
          {
            "id": "q-rmp-2-3",
            "question": "Что происходит с текущей Activity по умолчанию при повороте смартфона из портретной ориентации в альбомную?",
            "options": [
              "Ничего не происходит",
              "ОС уничтожает Activity (вызывая onDestroy) и создает ее заново (вызывая onCreate)",
              "Приложение аварийно завершается",
              "Экран гаснет на 10 минут"
            ],
            "correctIndex": 1,
            "explanation": "Смена ориентации является изменением конфигурации (Configuration Change), вызывающим полный цикл пересоздания Activity."
          },
          {
            "id": "q-rmp-2-4",
            "question": "Какой метод жизненного цикла вызывается, когда активность полностью перестает быть видимой для пользователя (свернута или перекрыта другим экраном)?",
            "options": [
              "onPause()",
              "onStop()",
              "onDestroy()",
              "onRestart()"
            ],
            "correctIndex": 1,
            "explanation": "onPause вызывается при частичной потере фокуса (например, всплывающем окне), а onStop — когда активность стала полностью невидимой."
          },
          {
            "id": "q-rmp-2-5",
            "question": "Какой объект структуры ключ-значение используется в методе onSaveInstanceState для сохранения временных данных экрана?",
            "options": [
              "ArrayList",
              "Bundle",
              "HashMap",
              "SQLite"
            ],
            "correctIndex": 1,
            "explanation": "Объект Bundle сериализует простые типы данных и строки для передачи между циклами пересоздания Activity."
          },
          {
            "id": "q-rmp-2-6",
            "question": "Какой метод жизненного цикла вызывается перед окончательным удалением Activity из оперативной памяти?",
            "options": [
              "onStop()",
              "onDestroy()",
              "onTerminate()",
              "onFinish()"
            ],
            "correctIndex": 1,
            "explanation": "onDestroy() — финальный вызов перед тем, как объект Activity будет уничтожен сборщиком мусора или системой."
          },
          {
            "id": "q-rmp-2-7",
            "question": "Какой архитектурный компонент библиотеки Android Jetpack сохраняет данные интерфейса при поворотах экрана без использования Bundle?",
            "options": [
              "Room",
              "ViewModel",
              "LiveData",
              "WorkManager"
            ],
            "correctIndex": 1,
            "explanation": "Экземпляр класса ViewModel переживает смену конфигураций Activity и сохраняет данные в памяти до окончательного завершения экрана."
          },
          {
            "id": "q-rmp-2-8",
            "question": "Что представляет собой Fragment в архитектуре Android?",
            "options": [
              "Осколок разбитого экрана",
              "Модульная переиспользуемая часть пользовательского интерфейса со своим собственным независимым жизненным циклом внутри родительской Activity",
              "Файл анимации",
              "Звуковой эффект"
            ],
            "correctIndex": 1,
            "explanation": "Фрагмент представляет собой модуль UI, который можно динамически добавлять, заменять и удалять внутри одной Activity (например, для планшетов)."
          },
          {
            "id": "q-rmp-2-9",
            "question": "Может ли операционная система Android завершить процесс невидимой Activity в состоянии onStop без вызова метода onDestroy при острой нехватке памяти?",
            "options": [
              "Нет, система всегда обязана вызвать onDestroy",
              "Да, фоновый процесс может быть принудительно убит системой (Kill Process) для освобождения памяти под активное приложение",
              "Только если пользователь нажал кнопку выключения",
              "Только на планшетах"
            ],
            "correctIndex": 1,
            "explanation": "При нехватке RAM системный процесс LMK (Low Memory Killer) мгновенно завершает фоновые приложения без выполнения их финализаторов."
          },
          {
            "id": "q-rmp-2-10",
            "question": "Какой метод Activity вызывается при возврате пользователя к свернутому приложению непосредственно перед методом onStart()?",
            "options": [
              "onRestart()",
              "onRecreate()",
              "onResume()",
              "onBegin()"
            ],
            "correctIndex": 0,
            "explanation": "Если Activity была остановлена (onStop), но не уничтожена, при возврате на экран сначала вызывается onRestart(), затем onStart()."
          }
        ]
      }
    },
    {
      "id": "top-rmp-3",
      "code": "3.1",
      "title": "Построение пользовательского интерфейса: ConstraintLayout и списки RecyclerView",
      "hours": 2,
      "sectionId": "sec-rmp-3",
      "shortDescription": "Иерархия View и ViewGroup, относительное позиционирование ConstraintLayout, адаптивные списки RecyclerView, паттерн ViewHolder, адаптеры (Adapter).",
      "prerequisites": ["top-rmp-1"],
      "position": { "x": 440, "y": 380 },
      "synopsis": {
        "summary": "Проектирование визуального слоя Android-приложений: декларативная верстка экранов на XML, гибкое связывание элементов в ConstraintLayout и создание высокопроизводительных бесконечных списков на базе RecyclerView.",
        "keyPoints": [
          "Базовые классы UI: `View` (атомарный визуальный элемент: Button, TextView) и `ViewGroup` (контейнер макета: LinearLayout, FrameLayout, ConstraintLayout).",
          "ConstraintLayout: гибкий макет, позволяющий позиционировать виджеты относительно друг друга и границ экрана без глубокой вложенности контейнеров.",
          "RecyclerView: современный продвинутый компонент для отображения больших наборов данных с повторным использованием ячеек памяти.",
          "Паттерн ViewHolder: кэширование ссылок на внутренние View элементов списка для исключения дорогостоящих вызовов `findViewById()` при скролле.",
          "Компоненты RecyclerView: `Adapter` (поставщик данных и создатель ViewHolder) и `LayoutManager` (LinearLayoutManager, GridLayoutManager)."
        ],
        "content": "### 1. Преимущества ConstraintLayout\n\nВ старых версиях верстка сложного экрана требовала множественной вложенности контейнеров `LinearLayout` внутри других `LinearLayout`, что приводило к рекурсивному расчету координат (**Multi-pass layout measurement**) и падению FPS:\n* `ConstraintLayout` обеспечивает **плоскую иерархию (Flat Hierarchy)**.\n* Каждый элемент привязывается минимум двумя ограничениями (по горизонтали и по вертикали):\n  ```xml\n  app:layout_constraintTop_toTopOf=\"parent\"\n  app:layout_constraintStart_toStartOf=\"parent\"\n  app:layout_constraintEnd_toEndOf=\"parent\"\n  ```\n* Поддерживает направляющие линии (Guideline), барьеры (Barrier) и цепочки элементов (Chains) с равномерным распределением весов.\n\n### 2. Принцип переиспользования в RecyclerView\n\nВ отличие от устаревшего `ListView`, который создавал объект для каждого элемента, `RecyclerView` держит в памяти только те ячейки, которые физически помещаются на экране, плюс 2–3 запасных:\n* Когда верхний элемент уходит за край экрана при прокрутке, его экземпляр `ViewHolder` не уничтожается, а отправляется в пул переиспользования (**Scrap Heap**).\n* Этот же `ViewHolder` подставляется снизу для нового появившегося элемента, и метод `onBindViewHolder()` просто заполняет его новыми данными.\n* Это гарантирует стабильные 60/120 кадров в секунду при отображении списков из десятков тысяч позиций.",
        "intuitSourceRef": "Курс ИНТУИТ «Разработка мобильных приложений под Android», Лекция 4: Пользовательский интерфейс и адаптивные списки"
      },
      "test": {
        "id": "test-rmp-3",
        "title": "Тест 3.1: Верстка: ConstraintLayout и RecyclerView",
        "durationMinutes": 15,
        "maxScore": 10,
        "questions": [
          {
            "id": "q-rmp-3-1",
            "question": "Какое главное архитектурное преимущество обеспечивает использование ConstraintLayout вместо глубоко вложенных LinearLayout?",
            "options": [
              "Уменьшение размера файла APK",
              "Плоская иерархия представлений (Flat View Hierarchy), исключающая многопроходные задержки перерасчета координат при отрисовке кадров",
              "Автоматический перевод на другие языки",
              "Бесплатная реклама"
            ],
            "correctIndex": 1,
            "explanation": "ConstraintLayout исключает вложенные контейнеры, рассчитывая все геометрические координаты виджетов в один математический проход."
          },
          {
            "id": "q-rmp-3-2",
            "question": "Сколько обязательных пространственных ограничений (constraints) должен иметь виджет в ConstraintLayout для однозначного позиционирования?",
            "options": [
              "Ни одного",
              "Минимум одно по горизонтали и минимум одно по вертикали",
              "Ровно четыре со всех сторон",
              "Десять"
            ],
            "correctIndex": 1,
            "explanation": "Элемент должен быть привязан минимум по двум осям: одной горизонтальной (Left/Right/Start/End) и одной вертикальной (Top/Bottom)."
          },
          {
            "id": "q-rmp-3-3",
            "question": "Какую ключевую задачу решает паттерн ViewHolder в адаптерах RecyclerView?",
            "options": [
              "Сохраняет данные в базу",
              "Кэширует ссылки на дочерние View ячейки списка, предотвращая постоянные дорогостоящие вызовы findViewById() при быстрой прокрутке",
              "Шифрует пароли",
              "Анимирует нажатия"
            ],
            "correctIndex": 1,
            "explanation": "ViewHolder единожды находит ссылки на TextView/ImageView элемента, чтобы при скролле метод onBindViewHolder не тратил ресурсы CPU на поиск по дереву."
          },
          {
            "id": "q-rmp-3-4",
            "question": "Какой вспомогательный компонент отвечает за пространственное расположение ячеек в RecyclerView (вертикальный список, сетка, плитка)?",
            "options": [
              "LayoutManager",
              "ItemAnimator",
              "ItemDecoration",
              "DiffUtil"
            ],
            "correctIndex": 0,
            "explanation": "LayoutManager определяет позиционирование: LinearLayoutManager (линейный список), GridLayoutManager (таблица/сетка) или StaggeredGridLayoutManager."
          },
          {
            "id": "q-rmp-3-5",
            "question": "Какой метод адаптера RecyclerView вызывается системой для связывания конкретных данных модели с элементами интерфейса ViewHolder?",
            "options": [
              "onCreateViewHolder()",
              "onBindViewHolder()",
              "getItemCount()",
              "notifyDataSetChanged()"
            ],
            "correctIndex": 1,
            "explanation": "Метод onBindViewHolder(holder, position) берет объект данных по индексу position и заполняет тексты/картинки в закэшированном holder."
          },
          {
            "id": "q-rmp-3-6",
            "question": "Какой утилитный класс в Android SDK позволяет рассчитывать точечную минимальную разницу между двумя списками для плавной анимации обновления RecyclerView?",
            "options": [
              "Math.diff",
              "DiffUtil",
              "CollectionUtils",
              "ListAdapter"
            ],
            "correctIndex": 1,
            "explanation": "Алгоритм DiffUtil находит точечные добавления, перемещения и удаления элементов списка без мерцающей полной перезагрузки."
          },
          {
            "id": "q-rmp-3-7",
            "question": "В каких единицах измерения принято задавать размеры шрифтов текста (fontSize) в Android для автоматического масштабирования под системные настройки слабовидящих пользователей?",
            "options": [
              "px (пиксели)",
              "dp (density-independent pixels)",
              "sp (scale-independent pixels)",
              "mm (миллиметры)"
            ],
            "correctIndex": 2,
            "explanation": "Единицы sp (Scale-independent Pixels) масштабируются не только от плотности пикселей экрана, но и от размера шрифта в системных настройках доступности."
          },
          {
            "id": "q-rmp-3-8",
            "question": "Какое значение атрибута ширины layout_width заставляет элемент растянуться на всю доступную ширину родительского контейнера?",
            "options": [
              "wrap_content",
              "match_parent (или 0dp в ConstraintLayout)",
              "fixed_size",
              "auto"
            ],
            "correctIndex": 1,
            "explanation": "match_parent указывает занять максимальный доступный размер родителя, а 0dp (match_constraint) растягивает виджет между установленными привязками."
          },
          {
            "id": "q-rmp-3-9",
            "question": "Что представляет собой невидимый вспомогательный элемент Guideline в ConstraintLayout?",
            "options": [
              "Инструкцию для пользователя",
              "Невидимую виртуальную опорную линию (горизонтальную или вертикальную) с привязкой в dp или процентах от экрана, к которой привязываются другие виджеты",
              "Рекламный баннер",
              "Линию отладки"
            ],
            "correctIndex": 1,
            "explanation": "Guideline — виртуальный маркер на макете (например, вертикальная линия на 30% ширины), служащий надежным якорем для группы элементов."
          },
          {
            "id": "q-rmp-3-10",
            "question": "Что делает значение layout_height='wrap_content'?",
            "options": [
              "Растягивает элемент на весь экран",
              "Устанавливает высоту, строго необходимую для отображения внутреннего содержимого виджета (текста, картинки)",
              "Скрывает элемент с экрана",
              "Задает нулевой размер"
            ],
            "correctIndex": 1,
            "explanation": "wrap_content сжимает размер контейнера до минимально достаточного для помещения содержащегося контента."
          }
        ]
      }
    },
    {
      "id": "top-rmp-4",
      "code": "4.1",
      "title": "Механизм Intents: явные и неявные намерения, навигация и передача данных",
      "hours": 2,
      "sectionId": "sec-rmp-3",
      "shortDescription": "Класс Intent, явный вызов Activity, неявные намерения (открытие браузера, звонок, камера), передача параметров через Extras, получение результата Activity Result API.",
      "prerequisites": ["top-rmp-2"],
      "position": { "x": 800, "y": 160 },
      "synopsis": {
        "summary": "Межкомпонентное взаимодействие в Android: механизм сообщений Intent, переход между экранами, глубокая интеграция со стандартными системными приложениями и передача данных через Bundle Extras.",
        "keyPoints": [
          "Intent (Намерение): объект асинхронного сообщения, описывающий требуемое действие и передаваемый системе для запуска компонентов (Activity, Service, Broadcast).",
          "Явный интент (Explicit Intent): указывает точный класс целевого компонента внутри текущего приложения: `Intent(this, SecondActivity::class.java)`.",
          "Неявный интент (Implicit Intent): описывает желаемое обобщенное действие (ACTION_VIEW, ACTION_SEND, ACTION_DIAL) и URI данных, позволяя ОС предложить пользователю выбор подходящих программ.",
          "Передача данных: метод `putExtra(key, value)` упаковывает аргументы в объект Intent.",
          "Современный Activity Result API: замена устаревшего `startActivityForResult()` типизированными контрактами `registerForActivityResult`."
        ],
        "content": "### 1. Явные и неявные Intent\n\n1. **Явный Intent (Explicit Intent):**\n   Применяется для внутренней навигации между экранами своего приложения:\n   ```kotlin\n   val intent = Intent(this, DetailActivity::class.java).apply {\n       putExtra(\"ITEM_ID\", 42)\n       putExtra(\"USER_NAME\", \"Алексей\")\n   }\n   startActivity(intent)\n   ```\n\n2. **Неявный Intent (Implicit Intent):**\n   Применяется для делегирования задачи сторонним приложениям (позвонить, открыть веб-ссылку, отправить email, сделать фото):\n   ```kotlin\n   // Открыть веб-сайт в установленном браузере\n   val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse(\"https://intuit.ru\"))\n   startActivity(webIntent)\n   ```\n   Система анализирует теги `<intent-filter>` всех установленных программ и открывает диалог выбора (App Chooser).\n\n### 2. Возврат результата из второй Activity\n\nСовременный подход использует контракт **Activity Result API**:\n```kotlin\nval launcher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->\n    if (result.resultCode == Activity.RESULT_OK) {\n        val data = result.data?.getStringExtra(\"RETURNED_VALUE\")\n        // Обработка полученных данных\n    }\n}\n// Запуск\nlauncher.launch(Intent(this, SelectionActivity::class.java))\n```",
        "intuitSourceRef": "Курс ИНТУИТ «Разработка мобильных приложений под Android», Лекция 5: Механизм Intent и организация навигации"
      },
      "test": {
        "id": "test-rmp-4",
        "title": "Тест 4.1: Механизм Intents и навигация",
        "durationMinutes": 15,
        "maxScore": 10,
        "questions": [
          {
            "id": "q-rmp-4-1",
            "question": "В чем заключается ключевое отличие явного интента (Explicit Intent) от неявного (Implicit Intent)?",
            "options": [
              "Явный интент работает быстрее",
              "Явный интент указывает точное имя класса целевой Activity внутри своего приложения, а неявный задает требуемое действие (Action), делегируя выбор приложения операционной системе",
              "Неявный интент платный",
              "Явный интент работает только в браузере"
            ],
            "correctIndex": 1,
            "explanation": "Явный интент однозначно запускает конкретный класс, а неявный описывает абстрактное действие (например, открыть ссылку или сделать фото)."
          },
          {
            "id": "q-rmp-4-2",
            "question": "Какой метод объекта Intent используется для передачи дополнительных параметров (строк, чисел, флагов) целевой активности?",
            "options": [
              "sendData()",
              "putExtra(ключ, значение)",
              "attach()",
              "append()"
            ],
            "correctIndex": 1,
            "explanation": "Метод putExtra() добавляет пары ключ-значение во внутренний контейнер Bundle интента."
          },
          {
            "id": "q-rmp-4-3",
            "question": "Какое стандартное действие (Action) используется в неявном интенте для открытия веб-страницы в браузере?",
            "options": [
              "Intent.ACTION_CALL",
              "Intent.ACTION_VIEW",
              "Intent.ACTION_EDIT",
              "Intent.ACTION_DELETE"
            ],
            "correctIndex": 1,
            "explanation": "Действие Intent.ACTION_VIEW универсально используется для просмотра данных по переданному URI (веб-сайты, геолокация на карте)."
          },
          {
            "id": "q-rmp-4-4",
            "question": "Какой тип данных должен реализовывать сложный пользовательский класс Kotlin/Java для быстрой бинарной передачи через Intent в Android?",
            "options": [
              "Comparable",
              "Parcelable (или стандартный Serializable)",
              "Runnable",
              "Cloneable"
            ],
            "correctIndex": 1,
            "explanation": "Интерфейс Parcelable высокоэффективно сериализует объекты в машинную память IPC (Inter-Process Communication) в Android."
          },
          {
            "id": "q-rmp-4-5",
            "question": "Что произойдет, если запустить неявный интент startActivity(), для которого в системе не установлено ни одного подходящего приложения?",
            "options": [
              "Приложение автоматически скачает нужную программу",
              "Произойдет аварийный сбой с неперехваченным исключением ActivityNotFoundException",
              "Телефон перезагрузится",
              "Ничего не произойдет"
            ],
            "correctIndex": 1,
            "explanation": "Если система не находит обработчика для интента, генерируется исключение ActivityNotFoundException, приводящее к вылету приложения без проверки resolveActivity."
          },
          {
            "id": "q-rmp-4-6",
            "question": "Какая функция завершает работу текущей Activity и возвращает пользователя на предыдущий экран в стеке переходов (Back Stack)?",
            "options": [
              "close()",
              "finish()",
              "stop()",
              "exit()"
            ],
            "correctIndex": 1,
            "explanation": "Вызов finish() инициирует корректное закрытие и удаление текущей Activity из стека переходов."
          },
          {
            "id": "q-rmp-4-7",
            "question": "Что представляет собой структура Back Stack в операционной системе Android?",
            "options": [
              "Резервную копию файлов",
              "Стек типа LIFO (Last In, First Out), хранящий порядок открытых пользователем экранов Activity для корректной навигации по кнопке «Назад»",
              "Очередь сетевых запросов",
              "Список контактов"
            ],
            "correctIndex": 1,
            "explanation": "Back Stack сохраняет историю открытых экранов; нажатие кнопки «Назад» выталкивает верхнюю активность из стека."
          },
          {
            "id": "q-rmp-4-8",
            "question": "Каким флагом интента можно предотвратить запуск повторного экземпляра Activity, если она уже находится на вершине стека навигации?",
            "options": [
              "FLAG_ACTIVITY_NEW_TASK",
              "FLAG_ACTIVITY_SINGLE_TOP",
              "FLAG_ACTIVITY_CLEAR_TOP",
              "FLAG_ACTIVITY_NO_HISTORY"
            ],
            "correctIndex": 1,
            "explanation": "Флаг FLAG_ACTIVITY_SINGLE_TOP не создает дубликат экрана, а направляет интент в уже существующую Activity через метод onNewIntent()."
          },
          {
            "id": "q-rmp-4-9",
            "question": "Как извлечь переданное числовое значение с ключом 'COUNT' во второй активности?",
            "options": [
              "val c = intent.getIntExtra('COUNT', 0)",
              "val c = intent.get('COUNT')",
              "val c = readNumber('COUNT')",
              "val c = System.getInt('COUNT')"
            ],
            "correctIndex": 0,
            "explanation": "Метод getIntExtra(key, defaultValue) возвращает значение или безопасное значение по умолчанию, если ключ отсутствует."
          },
          {
            "id": "q-rmp-4-10",
            "question": "Какой класс используется для принудительного вызова диалога выбора приложения (Chooser), даже если пользователь ранее выбрал «Всегда использовать»?",
            "options": [
              "Intent.createChooser()",
              "AlertDialog",
              "Toast",
              "Snackbar"
            ],
            "correctIndex": 0,
            "explanation": "Метод Intent.createChooser(targetIntent, title) гарантированно открывает системную шторку выбора программы."
          }
        ]
      }
    },
    {
      "id": "top-rmp-5",
      "code": "5.1",
      "title": "Постоянное хранение данных: SharedPreferences и библиотека Room (SQLite)",
      "hours": 2,
      "sectionId": "sec-rmp-4",
      "shortDescription": "Хранилище ключ-значение SharedPreferences / EncryptedSharedPreferences, реляционная БД SQLite, библиотека Room: Entities, DAO, RoomDatabase, асинхронные запросы.",
      "prerequisites": ["top-rmp-2", "top-rmp-3"],
      "position": { "x": 800, "y": 380 },
      "synopsis": {
        "summary": "Методы локального сохранения данных на мобильном устройстве: простое хранилище настроек SharedPreferences и объектно-реляционное отображение (ORM) в локальную базу данных SQLite с помощью библиотеки Android Room.",
        "keyPoints": [
          "SharedPreferences: легковесное хранилище примитивных данных (boolean, int, String) в виде XML-файлов в приватной директории приложения.",
          "Библиотека Room: официальная ORM-библиотека над SQLite, обеспечивающая проверку SQL-запросов во время компиляции.",
          "Три основных компонента Room: Entity (описание таблицы), DAO (Data Access Object — интерфейс запросов), Database (главная точка входа).",
          "Асинхронность: Room категорически запрещает выполнять запросы к БД в главном потоке интерфейса (Main Thread) во избежание зависаний (ANR).",
          "Интеграция с корутинами: функции DAO объявляются как `suspend fun` или возвращают `Flow` для реактивного наблюдения за изменениями."
        ],
        "content": "### 1. Хранилище настроек SharedPreferences\n\nИдеально подходит для флагов авторизации, выбранной темы оформления, языка интерфейса:\n```kotlin\nval prefs = getSharedPreferences(\"AppSettings\", Context.MODE_PRIVATE)\n\n// Запись (асинхронно через apply)\nprefs.edit().apply {\n    putBoolean(\"DARK_THEME\", true)\n    putString(\"USER_TOKEN\", \"xyz123\")\n    apply() // apply() сохраняет в фоне, commit() блокирует поток\n}\n\n// Чтение\nval isDark = prefs.getBoolean(\"DARK_THEME\", false)\n```\n\n### 2. Архитектура библиотеки Room (SQLite ORM)\n\nRoom абстрагирует низкоуровневые SQL-запросы:\n1. **Сущность (@Entity):**\n   ```kotlin\n   @Entity(tableName = \"students\")\n   data class Student(\n       @PrimaryKey(autoGenerate = true) val id: Long = 0,\n       @ColumnInfo(name = \"full_name\") val name: String,\n       val groupName: String,\n       val avgScore: Double\n   )\n   ```\n2. **Интерфейс доступа к данным (@Dao):**\n   ```kotlin\n   @Dao\n   interface StudentDao {\n       @Query(\"SELECT * FROM students WHERE groupName = :group\")\n       fun getStudentsByGroup(group: String): Flow<List<Student>>\n\n       @Insert(onConflict = OnConflictStrategy.REPLACE)\n       suspend fun insertStudent(student: Student)\n   }\n   ```\n3. **Класс базы данных (@Database):** синглтон, расширяющий `RoomDatabase`.",
        "intuitSourceRef": "Курс ИНТУИТ «Разработка мобильных приложений под Android», Лекция 7: Хранение данных: SharedPreferences и SQLite/Room"
      },
      "test": {
        "id": "test-rmp-5",
        "title": "Тест 5.1: Хранение данных: SharedPreferences и Room",
        "durationMinutes": 15,
        "maxScore": 10,
        "questions": [
          {
            "id": "q-rmp-5-1",
            "question": "Для какого типа данных оптимально использовать хранилище SharedPreferences?",
            "options": [
              "Для видеофайлов высокого разрешения",
              "Для простых настроек приложения (флаги, переключатели, строки, токены сессии)",
              "Для реляционных баз данных с внешними ключами",
              "Для хранения 3D-моделей"
            ],
            "correctIndex": 1,
            "explanation": "SharedPreferences спроектирован для хранения небольших наборов пар «ключ-значение» примитивных типов."
          },
          {
            "id": "q-rmp-5-2",
            "question": "В чем отличие метода editor.apply() от editor.commit() при записи в SharedPreferences?",
            "options": [
              "commit() асинхронный, а apply() блокирует поток",
              "apply() выполняет запись в фоновом потоке без возврата результата, а commit() синхронно блокирует вызывающий поток и возвращает boolean",
              "Они абсолютно одинаковы",
              "apply() стирает все данные"
            ],
            "correctIndex": 1,
            "explanation": "apply() предпочтителен в UI-потоке, так как не вызывает задержек, сохраняя данные в памяти и сбрасывая на диск асинхронно."
          },
          {
            "id": "q-rmp-5-3",
            "question": "Какая встроенная реляционная СУБД лежит в основе базы данных операционной системы Android?",
            "options": [
              "PostgreSQL",
              "SQLite",
              "Oracle DB",
              "MongoDB"
            ],
            "correctIndex": 1,
            "explanation": "В Android встроена компактная и сверхбыстрая безсерверная реляционная СУБД SQLite."
          },
          {
            "id": "q-rmp-5-4",
            "question": "Что представляет собой компонент DAO (Data Access Object) в библиотеке Room?",
            "options": [
              "Таблицу базы данных",
              "Интерфейс (или абстрактный класс), объявляющий SQL-запросы (@Query, @Insert, @Delete) для манипулирования сущностями базы данных",
              "Драйвер видеокарты",
              "Файл разметки XML"
            ],
            "correctIndex": 1,
            "explanation": "DAO — это интерфейс доступа к данным, в котором разработчик описывает сигнатуры методов и SQL-запросы в аннотациях."
          },
          {
            "id": "q-rmp-5-5",
            "question": "Почему библиотека Room по умолчанию запрещает выполнение запросов к базе данных в главном потоке (Main Thread)?",
            "options": [
              "База данных заблокирована паролем",
              "Операции дискового ввода-вывода могут занять длительное время и заморозить отрисовку интерфейса, вызвав системную ошибку ANR (Application Not Responding)",
              "Это ограничение операционной системы Linux",
              "Чтобы экономить интернет"
            ],
            "correctIndex": 1,
            "explanation": "Чтение/запись на диск непредсказуемы по времени; блокировка главного потока свыше 5 секунд вызывает диалог «Приложение не отвечает» (ANR)."
          },
          {
            "id": "q-rmp-5-6",
            "question": "Какая аннотация Room используется для объявления класса в качестве таблицы базы данных?",
            "options": [
              "@Table",
              "@Entity",
              "@Database",
              "@Row"
            ],
            "correctIndex": 1,
            "explanation": "Аннотация @Entity помечает дата-класс как объект таблицы в схеме SQLite."
          },
          {
            "id": "q-rmp-5-7",
            "question": "Какая аннотация помечает поле сущности Room в качестве первичного автоинкрементного ключа?",
            "options": [
              "@PrimaryKey(autoGenerate = true)",
              "@Key",
              "@Unique",
              "@Id"
            ],
            "correctIndex": 0,
            "explanation": "@PrimaryKey(autoGenerate = true) указывает SQLite автоматически назначать уникальный растущий номер каждой новой записи."
          },
          {
            "id": "q-rmp-5-8",
            "question": "В чем заключается главное преимущество библиотеки Room перед прямым использованием стандартного SQLiteOpenHelper?",
            "options": [
              "Room не требует памяти",
              "Проверка синтаксиса SQL-запросов и типов на этапе компиляции, автогенерация шаблонного кода и поддержка реактивных потоков Flow/LiveData",
              "Room заменяет процессор",
              "База данных хранится в облаке"
            ],
            "correctIndex": 1,
            "explanation": "Room проверяет опечатки в SQL-запросах прямо при сборке проекта, защищая от падений во время выполнения."
          },
          {
            "id": "q-rmp-5-9",
            "question": "Какое ключевое слово языка Kotlin добавляется к методам интерфейса DAO для выполнения запросов внутри корутин?",
            "options": [
              "async",
              "suspend",
              "await",
              "thread"
            ],
            "correctIndex": 1,
            "explanation": "Модификатор `suspend` делает функцию приостанавливаемой, позволяя безопасно вызывать ее из корутин без блокировки потока."
          },
          {
            "id": "q-rmp-5-10",
            "question": "Где физически располагаются файлы базы данных SQLite конкретного приложения в файловой системе смартфона?",
            "options": [
              "На SD-карте в открытом доступе",
              "В приватной директории /data/data/ИМЯ_ПАКЕТА/databases/, защищенной правами пользователя Sandbox",
              "В системной папке Windows",
              "В оперативной памяти BIOS"
            ],
            "correctIndex": 1,
            "explanation": "Файлы баз данных изолированы в приватной системной директории приложения и недоступны другим программам без Root-прав."
          }
        ]
      }
    },
    {
      "id": "top-rmp-6",
      "code": "6.1",
      "title": "Сетевое взаимодействие: REST API, библиотека Retrofit и Kotlin Coroutines",
      "hours": 2,
      "sectionId": "sec-rmp-4",
      "shortDescription": "Сетевой клиент Retrofit, конвертеры JSON (Moshi / Gson), HTTP-методы GET/POST, работа в фоновых потоках с помощью Kotlin Coroutines (Dispatchers.IO).",
      "prerequisites": ["top-rmp-4", "top-rmp-5"],
      "position": { "x": 1160, "y": 260 },
      "synopsis": {
        "summary": "Разработка клиент-серверного взаимодействия в мобильных приложениях: отправка HTTP-запросов к REST API через библиотеку Retrofit, десериализация JSON-ответов и организация асинхронного кода с помощью Kotlin Coroutines.",
        "keyPoints": [
          "Сетевые запросы категорически запрещены в Main Thread (вызывают исключение `NetworkOnMainThreadException`).",
          "Библиотека Retrofit: типобезопасный HTTP-клиент для Android от компании Square, преобразующий интерфейс Kotlin в сетевые вызовы.",
          "Конвертеры данных: автоматический парсинг JSON в структуры данных Kotlin (data class) с помощью библиотек Moshi или Gson.",
          "Kotlin Coroutines: легковесные потоки для асинхронного программирования. Переключение на пул ввода-вывода выполняется диспетчером `Dispatchers.IO`.",
          "Разрешение в манифесте: обязательное добавление права `<uses-permission android:name='android.permission.INTERNET' />`."
        ],
        "content": "### 1. Архитектура клиента Retrofit\n\nRetrofit строит запросы на базе интерфейсов с аннотациями:\n```kotlin\ninterface ApiService {\n    @GET(\"api/v1/courses\")\n    suspend fun getCourses(): List<CourseDto>\n\n    @POST(\"api/v1/auth/login\")\n    suspend fun login(@Body credentials: LoginRequest): AuthResponse\n}\n\n// Создание экземпляра синглтона\nval retrofit = Retrofit.Builder()\n    .baseUrl(\"https://api.intuit.ru/\")\n    .addConverterFactory(MoshiConverterFactory.create())\n    .build()\n\nval api = retrofit.create(ApiService::class.java)\n```\n\n### 2. Выполнение запроса с Kotlin Coroutines\n\nВ связке с Android Jetpack `viewModelScope` запрос выполняется без риска утечки памяти:\n```kotlin\nclass CourseViewModel(private val repository: CourseRepository) : ViewModel() {\n    val courses = MutableLiveData<List<CourseDto>>()\n    val isLoading = MutableLiveData<Boolean>()\n\n    fun loadCourses() {\n        viewModelScope.launch {\n            isLoading.value = true\n            try {\n                // Выполняется асинхронно в потоке Dispatchers.IO\n                val result = withContext(Dispatchers.IO) {\n                    repository.fetchCourses()\n                }\n                courses.value = result // Обновление LiveData в Main Thread\n            } catch (e: Exception) {\n                // Обработка сетевой ошибки (таймаут, нет интернета)\n            } finally {\n                isLoading.value = false\n            }\n        }\n    }\n}\n```",
        "intuitSourceRef": "Курс ИНТУИТ «Разработка мобильных приложений под Android», Лекция 9: Сетевые протоколы, работа с REST API и парсинг данных"
      },
      "test": {
        "id": "test-rmp-6",
        "title": "Тест 6.1: Сетевые запросы, Retrofit и Coroutines",
        "durationMinutes": 15,
        "maxScore": 10,
        "questions": [
          {
            "id": "q-rmp-6-1",
            "question": "Какое исключение выбрасывает Android при попытке выполнить синхронный сетевой HTTP-запрос в главном потоке интерфейса (Main Thread)?",
            "options": [
              "NullPointerException",
              "NetworkOnMainThreadException",
              "OutOfMemoryError",
              "IndexOutOfBoundsException"
            ],
            "correctIndex": 1,
            "explanation": "Операционная система жестко блокирует сетевые операции в главном UI-потоке, выбрасывая NetworkOnMainThreadException."
          },
          {
            "id": "q-rmp-6-2",
            "question": "Какое разрешение необходимо обязательно объявить в файле AndroidManifest.xml для работы с сетевыми ресурсами?",
            "options": [
              "<uses-permission android:name='android.permission.INTERNET' />",
              "<uses-permission android:name='android.permission.CAMERA' />",
              "<uses-permission android:name='android.permission.BLUETOOTH' />",
              "Разрешения не требуются"
            ],
            "correctIndex": 0,
            "explanation": "Без декларации разрешения INTERNET приложение не сможет открыть ни одного сетевого сокета."
          },
          {
            "id": "q-rmp-6-3",
            "question": "Какую ключевую роль выполняет библиотека Retrofit в проектах под Android?",
            "options": [
              "Рисует трехмерные графики",
              "Преобразует HTTP REST API в типобезопасный интерфейс языка Kotlin/Java с автоматической сериализацией и десериализацией данных",
              "Шифрует пароли на флешке",
              "Заменяет операционную систему"
            ],
            "correctIndex": 1,
            "explanation": "Retrofit берет на себя формирование URL, HTTP-заголовков, методов GET/POST и преобразование JSON в объекты."
          },
          {
            "id": "q-rmp-6-4",
            "question": "Какой диспетчер корутин (CoroutineDispatcher) в Kotlin предназначен для выполнения сетевых запросов и дисковых операций ввода-вывода?",
            "options": [
              "Dispatchers.Main",
              "Dispatchers.IO",
              "Dispatchers.Default",
              "Dispatchers.Unconfined"
            ],
            "correctIndex": 1,
            "explanation": "Пул потоков Dispatchers.IO специально оптимизирован для блокирующих операций ввода-вывода (сети и диска)."
          },
          {
            "id": "q-rmp-6-5",
            "question": "Какая популярная библиотека используется в связке с Retrofit для преобразования JSON-ответов сервера в дата-классы Kotlin?",
            "options": [
              "Moshi или Gson",
              "OpenGL",
              "FFmpeg",
              "Room"
            ],
            "correctIndex": 0,
            "explanation": "Moshi и Gson — специализированные парсеры, автоматически сопоставляющие поля JSON со свойствами классов."
          },
          {
            "id": "q-rmp-6-6",
            "question": "Какая область видимости корутин (CoroutineScope) автоматически отменяет запущенные сетевые запросы при уничтожении соответствующей ViewModel?",
            "options": [
              "GlobalScope",
              "viewModelScope",
              "ProcessLifecycleOwner",
              "MainScope"
            ],
            "correctIndex": 1,
            "explanation": "viewModelScope привязан к жизненному циклу ViewModel: при уходе с экрана все активные запросы автоматически отменяются, исключая утечки памяти."
          },
          {
            "id": "q-rmp-6-7",
            "question": "Какой HTTP-метод используется по стандарту REST для создания новой сущности на сервере с передачей тела запроса?",
            "options": [
              "GET",
              "POST",
              "DELETE",
              "HEAD"
            ],
            "correctIndex": 1,
            "explanation": "Метод POST используется для передачи новых данных на сервер в теле (Body) запроса."
          },
          {
            "id": "q-rmp-6-8",
            "question": "Какая аннотация Retrofit используется для подстановки динамической переменной в путь URL (например, 'users/{id}')?",
            "options": [
              "@Query",
              "@Path",
              "@Body",
              "@Header"
            ],
            "correctIndex": 1,
            "explanation": "Аннотация @Path('id') заменяет фигурные скобки в шаблоне URL на фактическое значение аргумента функции."
          },
          {
            "id": "q-rmp-6-9",
            "question": "В чем заключается преимущество корутин Kotlin перед традиционными тяжелыми потоками ОС (Threads)?",
            "options": [
              "Они используют искусственный интеллект",
              "Корутины легковесны (в одном потоке ОС могут выполняться тысячи корутин без затрат на дорогостоящее переключение контекста ядра)",
              "Корутины работают только на серверах",
              "Они работают без компилятора"
            ],
            "correctIndex": 1,
            "explanation": "Корутины — это кооперативная многозадачность пользовательского уровня: приостановка корутины не блокирует поток ОС."
          },
          {
            "id": "q-rmp-6-10",
            "question": "Какую ошибку протокола HTTP возвращает сервер при попытке доступа к защищенному ресурсу без предоставления валидного авторизационного токена (Bearer)?",
            "options": [
              "200 OK",
              "401 Unauthorized",
              "404 Not Found",
              "500 Internal Server Error"
            ],
            "correctIndex": 1,
            "explanation": "Код статуса 401 Unauthorized указывает на отсутствие или недействительность учетных данных аутентификации."
          }
        ]
      }
    }
  ]
};
