import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import { t } from '~/services';
import { Colors } from '~/styles';
import { IImageOption } from '~/types';
import { ITaskBase } from '~/types/ITask';

export {
  getNextParentStatus,
  normalizeTaskStatus,
  PARENT_STATUS_CYCLE,
  TASK_STATUS_COLORS
} from './tasks/taskStatus';

export const DEFAULT_BASE_TASK_COLOR = Colors.green500;
export const DEFAULT_TASK_ASSIGNMENT_COLOR = Colors.blue600;
export const DEFAULT_HABIT_ASSIGNMENT_COLOR = Colors.green500;

export const getBaseTasks = (): ITaskBase[] => {
  // LocalizationService.initSync();

  return [
  {
    id: 'complete_all_day_tasks',
    name: t('tasks.baseTasks.completeAllDayTasks'),
    description: t('tasks.baseTasks.completeAllDayTasksDescription'),
    picture: 'tasks_done',
    time: '23:59',
    color: Colors.gold500,
    reward: 5,
  },
  {
    id: 'complete_all_week_tasks',
    name: t('tasks.baseTasks.completeAllWeekTasks'),
    description: t('tasks.baseTasks.completeAllWeekTasksDescription'),
    picture: 'tasks_done',
    time: '23:59',
    color: Colors.gold500,
    reward: 20,
  },
  {
    id: 'morningRoutine',
    name: t('tasks.baseTasks.morningRoutine.title'),
    description: t('tasks.baseTasks.morningRoutine.description'),
    picture: 'brush_teeth',
    time: '08:00',
    color: Colors.green400,
    reward: 10,
    subtasks: [
      {
        value: 'morningRoutineSubtask1',
        label: t('tasks.baseTasks.morningRoutine.subtask1'),
      },
      {
        value: 'morningRoutineSubtask2',
        label: t('tasks.baseTasks.morningRoutine.subtask2'),
      },
      {
        value: 'morningRoutineSubtask3',
        label: t('tasks.baseTasks.morningRoutine.subtask3'),
      },
      {
        value: 'morningRoutineSubtask4',
        label: t('tasks.baseTasks.morningRoutine.subtask4'),
      },
      {
        value: 'morningRoutineSubtask5',
        label: t('tasks.baseTasks.morningRoutine.subtask5'),
      },
    ],
  },
  {
    id: 'eveningRoutine',
    name: t('tasks.baseTasks.eveningRoutine.title'),
    description: t('tasks.baseTasks.eveningRoutine.description'),
    picture: 'brush_teeth',
    time: '18:00',
    color: Colors.green400,
    reward: 7,
    subtasks: [
      {
        value: 'eveningRoutineSubtask1',
        label: t('tasks.baseTasks.eveningRoutine.subtask1'),
      },
      {
        value: 'eveningRoutineSubtask2',
        label: t('tasks.baseTasks.eveningRoutine.subtask2'),
      },
    ],
  },
  {
    id: 'afterSchool',
    name: t('tasks.baseTasks.afterSchool.title'),
    description: t('tasks.baseTasks.afterSchool.description'),
    picture: 'tasks_done',
    time: '15:00',
    color: Colors.blue400,
    reward: 10,
    subtasks: [
      {
        value: 'afterSchoolSubtask1',
        label: t('tasks.baseTasks.afterSchool.subtask1'),
      },
      {
        value: 'afterSchoolSubtask2',
        label: t('tasks.baseTasks.afterSchool.subtask2'),
      },
      {
        value: 'afterSchoolSubtask3',
        label: t('tasks.baseTasks.afterSchool.subtask3'),
      },
    ],
  },
  {
    id: 'creativeWork',
    name: t('tasks.baseTasks.creativeWork.title'),
    description: t('tasks.baseTasks.creativeWork.description'),
    picture: 'tasks_done',
    time: '15:00',
    color: Colors.blue400,
    reward: 10,
    subtasks: [
      {
        value: 'creativeWorkSubtask1',
        label: t('tasks.baseTasks.creativeWork.subtask1'),
      },
      {
        value: 'creativeWorkSubtask2',
        label: t('tasks.baseTasks.creativeWork.subtask2'),
      },
      {
        value: 'creativeWorkSubtask3',
        label: t('tasks.baseTasks.creativeWork.subtask3'),
      },
      {
        value: 'creativeWorkSubtask4',
        label: t('tasks.baseTasks.creativeWork.subtask4'),
      },
      {
        value: 'creativeWorkSubtask5',
        label: t('tasks.baseTasks.creativeWork.subtask5'),
      },
    ],
  },
  {
    id: 'brushTeethMorning',
    name: t('tasks.baseTasks.brushTeethMorning'),
    description: t('tasks.baseTasks.brushTeethMorningDescription'),
    picture: 'brush_teeth',
    time: '08:00',
  },
  {
    id: 'brushTeethEvening',
    name: t('tasks.baseTasks.brushTeethEvening'),
    description: t('tasks.baseTasks.brushTeethEveningDescription'),
    picture: 'brush_teeth',
    time: '18:00',
  },
  {
    id: 'washYourHands',
    name: t('tasks.baseTasks.washYourHands'),
    description: t('tasks.baseTasks.washYourHandsDescription'),
    picture: 'wash_hands',
    time: '8:05',
  },
  {
    id: 'washYourFace',
    name: t('tasks.baseTasks.washYourFace'),
    description: t('tasks.baseTasks.washYourFaceDescription'),
    picture: 'wash_hair',
    time: '9:06',
  },
  {
    id: 'brushYourHair',
    name: t('tasks.baseTasks.brushYourHair'),
    description: t('tasks.baseTasks.brushYourHairDescription'),
    picture: 'brush_hair',
    time: '9:07',
  },
  {
    id: 'cutYourNails',
    name: t('tasks.baseTasks.cutYourNails'),
    description: t('tasks.baseTasks.cutYourNailsDescription'),
    picture: 'cut_nails',
    time: '9:08',
  },
  {
    id: 'changeYourClothes',
    name: t('tasks.baseTasks.changeYourClothes'),
    description: t('tasks.baseTasks.changeYourClothesDescription'),
    picture: 'change_clothes',
    time: '9:09',
  },
  {
    id: 'applyCream',
    name: t('tasks.baseTasks.applyCream'),
    description: t('tasks.baseTasks.applyCreamDescription'),
    picture: 'put_cream',
    time: '9:10',
  },
  {
    id: 'dayWithoutSweets',
    name: t('tasks.baseTasks.dayWithoutSweets'),
    description: t('tasks.baseTasks.dayWithoutSweetsDescription'),
    picture: 'day_without_sweets',
    time: '9:11',
  },
  {
    id: 'drinkWater',
    name: t('tasks.baseTasks.drinkWater'),
    description: t('tasks.baseTasks.drinkWaterDescription'),
    picture: 'glass_of_water',
    time: '15:12',
  },
  {
    id: 'getUpOnTime',
    name: t('tasks.baseTasks.getUpOnTime'),
    description: t('tasks.baseTasks.getUpOnTimeDescription'),
    picture: 'alarm_morning',
    time: '9:13',
  },
  {
    id: 'goToBedOnTime',
    name: t('tasks.baseTasks.goToBedOnTime'),
    description: t('tasks.baseTasks.goToBedOnTimeDescription'),
    picture: 'alarm_morning',
    time: '21:00',
  },
  {
    id: 'makeBed',
    name: t('tasks.baseTasks.makeBed'),
    description: t('tasks.baseTasks.makeBedDescription'),
    picture: 'make_bed',
    time: '9:14',
  },
  {
    id: 'prepareClothesForTomorrow',
    name: t('tasks.baseTasks.prepareClothesForTomorrow'),
    description: t('tasks.baseTasks.prepareClothesForTomorrowDescription'),
    picture: 'clothes_tomorrow',
    time: '9:15',
  },
  {
    id: 'tidyUpPencilCase',
    name: t('tasks.baseTasks.tidyUpPencilCase'),
    description: t('tasks.baseTasks.tidyUpPencilCaseDescription'),
    picture: 'tidy_up_pencil_case',
    time: '9:16',
  },
  {
    id: 'cleanDesk',
    name: t('tasks.baseTasks.cleanDesk'),
    description: t('tasks.baseTasks.cleanDeskDescription'),
    picture: 'clean_desk',
    time: '15:17',
  },
  {
    id: 'packBackpack',
    name: t('tasks.baseTasks.packBackpack'),
    description: t('tasks.baseTasks.packBackpackDescription'),
    picture: 'pack_backpack',
    time: '15:18',
  },
  {
    id: 'tidyUpRoom',
    name: t('tasks.baseTasks.tidyUpYourRoom'),
    description: t('tasks.baseTasks.tidyUpYourRoomDescription'),
    picture: 'tidy_up_room',
    time: '15:20',
  },
  {
    id: 'putAwayToys',
    name: t('tasks.baseTasks.putAwayToys'),
    description: t('tasks.baseTasks.putAwayToysDescription'),
    picture: 'put_away_toys',
    time: '20:40',
  },
  {
    id: 'putAwayClothes',
    name: t('tasks.baseTasks.putAwayClothes'),
    description: t('tasks.baseTasks.putAwayClothesDescription'),
    picture: 'organize_clothes',
    time: '20:41',
  },
  {
    id: 'takeOutTrash',
    name: t('tasks.baseTasks.takeOutTrash'),
    description: t('tasks.baseTasks.takeOutTrashDescription'),
    picture: 'trash',
    time: '20:42',
  },
  {
    id: 'helpToCoverTheTable',
    name: t('tasks.baseTasks.helpToCoverTheTable'),
    description: t('tasks.baseTasks.helpToCoverTheTableDescription'),
    picture: 'serve_table',
    time: '20:43',
  },
  {
    id: 'washYourOwnDishes',
    name: t('tasks.baseTasks.washYourOwnDishes'),
    description: t('tasks.baseTasks.washYourOwnDishesDescription'),
    picture: 'wash_dishes',
    time: '15:32',
  },
  {
    id: 'cleanUpAfterMeal',
    name: t('tasks.baseTasks.cleanUpAfterMeal'),
    description: t('tasks.baseTasks.cleanUpAfterMealDescription'),
    picture: 'wash_dishes',
    time: '15:33',
  },
  {
    id: 'loadTheDishwasher',
    name: t('tasks.baseTasks.loadTheDishwasher'),
    description: t('tasks.baseTasks.loadTheDishwasherDescription'),
    picture: 'wash_dishes',
    time: '15:34',
  },
  {
    id: 'takeCareOfPlants',
    name: t('tasks.baseTasks.takeCareOfPlants'),
    description: t('tasks.baseTasks.takeCareOfPlantsDescription'),
    picture: 'water_plants',
    time: '15:35',
  },
  {
    id: 'putAwayBooks',
    name: t('tasks.baseTasks.putAwayBooks'),
    description: t('tasks.baseTasks.putAwayBooksDescription'),
    picture: 'put_in_order_books',
    time: '15:36',
  },
  {
    id: 'lineUpShoes',
    name: t('tasks.baseTasks.lineUpShoes'),
    description: t('tasks.baseTasks.lineUpShoesDescription'),
    picture: 'line_up_shoes',
    time: '15:37',
  },
  {
    id: 'sweepTheDirt',
    name: t('tasks.baseTasks.sweepTheDirt'),
    description: t('tasks.baseTasks.sweepTheDirtDescription'),
    picture: 'dust_furniture',
    time: '15:38',
  },
  {
    id: 'cleanShoes',
    name: t('tasks.baseTasks.cleanShoes'),
    description: t('tasks.baseTasks.cleanShoesDescription'),
    picture: 'clean_shoes',
    time: '15:40',
  },
  {
    id: 'sweepTheFloor',
    name: t('tasks.baseTasks.sweepTheFloor'),
    description: t('tasks.baseTasks.sweepTheFloorDescription'),
    picture: 'sweep_floor',
    time: '15:41',
  },
  {
    id: 'washTheFloor',
    name: t('tasks.baseTasks.washTheFloor'),
    description: t('tasks.baseTasks.washTheFloorDescription'),
    picture: 'clean_floor',
    time: '15:42',
  },  
  {
    id: 'vacuumTheFurniture',
    name: t('tasks.baseTasks.vacuumTheFurniture'),
    description: t('tasks.baseTasks.vacuumTheFurnitureDescription'),
    picture: 'vacuum_cleaning',
    time: '15:39',
  },
  {
    id: 'runTheVacuumCleaner',
    name: t('tasks.baseTasks.runTheVacuumCleaner'),
    description: t('tasks.baseTasks.runTheVacuumCleanerDescription'),
    picture: 'robot',
    time: '15:43',
  },
  {
    id: 'putDirtyClothesInTheBin',
    name: t('tasks.baseTasks.putDirtyClothesInTheBin'),
    description: t('tasks.baseTasks.putDirtyClothesInTheBinDescription'),
    picture: 'dirty_clothes_to_bin',
    time: '15:39',
  },
  {
    id: 'do_homework',
    name: t('tasks.baseTasks.doHomework'),
    description: t('tasks.baseTasks.doHomeworkDescription'),
    picture: 'do_homework',
  },
  {
    id: 'repeatTheMaterial',
    name: t('tasks.baseTasks.repeatTheMaterial'),
    description: t('tasks.baseTasks.repeatTheMaterialDescription'),
    picture: 'do_homework',
  },
  {
    id: 'prepareForTheTest',
    name: t('tasks.baseTasks.prepareForTheTest'),
    description: t('tasks.baseTasks.prepareForTheTestDescription'),
    picture: 'do_homework',
  },
  {
    id: 'learnNewTopic',
    name: t('tasks.baseTasks.learnNewTopic'),
    description: t('tasks.baseTasks.learnNewTopicDescription'),
    picture: 'do_homework',
  },
  {
    id: 'learnNewLanguage',
    name: t('tasks.baseTasks.learnNewLanguage'),
    description: t('tasks.baseTasks.learnNewLanguageDescription'),
    picture: 'foreign_language',
  },
  {
    id: 'readOnePage',
    name: t('tasks.baseTasks.readOnePage'),
    description: t('tasks.baseTasks.readOnePageDescription'),
    picture: 'read_book',
  },
  {
    id: 'readFor20Minutes',
    name: t('tasks.baseTasks.readFor20Minutes'),
    description: t('tasks.baseTasks.readFor20MinutesDescription'),
    picture: 'read_book',
  },
  {
    id: 'reciteTheRead',
    name: t('tasks.baseTasks.reciteTheRead'),
    description: t('tasks.baseTasks.reciteTheReadDescription'),
    picture: 'read_book',
  },
  {
    id: 'logicalGames',
    name: t('tasks.baseTasks.logicalGames'),
    description: t('tasks.baseTasks.logicalGamesDescription'),
    picture: 'logic_games',
  },
  {
    id: 'solveThePuzzle',
    name: t('tasks.baseTasks.solveThePuzzle'),
    description: t('tasks.baseTasks.solveThePuzzleDescription'),
    picture: 'logic_games',
  },
  {
    id: 'drawAPicture',
    name: t('tasks.baseTasks.drawAPicture'),
    description: t('tasks.baseTasks.drawAPictureDescription'),
    picture: 'painting',
  },
  {
    id: 'makeAnApplique',
    name: t('tasks.baseTasks.makeAnApplique'),
    description: t('tasks.baseTasks.makeAnAppliqueDescription'),
    picture: 'cut_of_paper',
  },
  {
    id: 'playAnMusicInstrument',
    name: t('tasks.baseTasks.playAnMusicInstrument'),
    description: t('tasks.baseTasks.playAnMusicInstrumentDescription'),
    picture: 'music',
  },
  {
    id: 'singASong',
    name: t('tasks.baseTasks.singASong'),
    description: t('tasks.baseTasks.singASongDescription'),
    picture: 'music',
  },
  {
    id: 'musicTheory',
    name: t('tasks.baseTasks.musicTheory'),
    description: t('tasks.baseTasks.musicTheoryDescription'),
    picture: 'music',
  },
  {
    id: 'morningExercise',
    name: t('tasks.baseTasks.morningExercise'),
    description: t('tasks.baseTasks.morningExerciseDescription'),
    picture: 'training',
  },
  {
    id: 'eveningExercises',
    name: t('tasks.baseTasks.eveningExercises'),
    description: t('tasks.baseTasks.eveningExercisesDescription'),
    picture: 'training',
  },
  {
    id: 'homeTraining',
    name: t('tasks.baseTasks.homeTraining'),
    description: t('tasks.baseTasks.homeTrainingDescription'),
    picture: 'active_game',
  },
  {
    id: 'activeGame',
    name: t('tasks.baseTasks.activeGame'),
    description: t('tasks.baseTasks.activeGameDescription'),
    picture: 'active_game',
  },
  {
    id: 'stretch',
    name: t('tasks.baseTasks.stretch'),
    description: t('tasks.baseTasks.stretchDescription'),
    picture: 'training',
  },
  {
    id: 'squats',
    name: t('tasks.baseTasks.squats'),
    description: t('tasks.baseTasks.squatsDescription'),
    picture: 'training',
  },
  {
    id: 'pullUps',
    name: t('tasks.baseTasks.pullUps'),
    description: t('tasks.baseTasks.pullUpsDescription'),
    picture: 'training',
  },
  {
    id: 'pushUps',
    name: t('tasks.baseTasks.pushUps'),
    description: t('tasks.baseTasks.pushUpsDescription'),
    picture: 'training',
  },
  {
    id: 'walk',
    name: t('tasks.baseTasks.walk'),
    description: t('tasks.baseTasks.walkDescription'),
    picture: 'jogging',
  },
  {
    id: 'hike',
    name: t('tasks.baseTasks.hike'),
    description: t('tasks.baseTasks.hikeDescription'),
    picture: 'jogging',
  },
  {
    id: 'playOutside',
    name: t('tasks.baseTasks.playOutside'),
    description: t('tasks.baseTasks.playOutsideDescription'),
    picture: 'active_game',
  },
  {
    id: 'rideABicycle',
    name: t('tasks.baseTasks.rideABicycle'),
    description: t('tasks.baseTasks.rideABicycleDescription'),
    picture: 'bike',
  },
  {
    id: 'jumpOnTheTrampoline',
    name: t('tasks.baseTasks.jumpOnTheTrampoline'),
    description: t('tasks.baseTasks.jumpOnTheTrampolineDescription'),
    picture: 'jumping',
  },
  {
    id: 'swim',
    name: t('tasks.baseTasks.swim'),
    description: t('tasks.baseTasks.swimDescription'),
    picture: 'swim',
  },
  {
    id: 'run',
    name: t('tasks.baseTasks.run'),
    description: t('tasks.baseTasks.runDescription'),
    picture: 'jogging',
  },
  {
    id: 'helpToPrepareFood',
    name: t('tasks.baseTasks.helpToPrepareFood'),
    description: t('tasks.baseTasks.helpToPrepareFoodDescription'),
    picture: 'dish',
  },
  {
    id: 'feedThePet',
    name: t('tasks.baseTasks.feedThePet'),
    description: t('tasks.baseTasks.feedThePetDescription'),
    picture: 'feed_pet',
  },
  {
    id: 'pourWaterToThePet',
    name: t('tasks.baseTasks.pourWaterToThePet'),
    description: t('tasks.baseTasks.pourWaterToThePetDescription'),
    picture: 'water_for_pet',
  },
  {
    id: 'walkTheDog',
    name: t('tasks.baseTasks.walkTheDog'),
    description: t('tasks.baseTasks.walkTheDogDescription'),
    picture: 'walk_the_dog',
  },
  {
    id: 'cleanTheCage',
    name: t('tasks.baseTasks.cleanTheCage'),
    description: t('tasks.baseTasks.cleanTheCageDescription'),
    picture: 'clean_cage',
  },
  {
    id: 'playWithThePet',
    name: t('tasks.baseTasks.playWithThePet'),
    description: t('tasks.baseTasks.playWithThePetDescription'),
    picture: 'play_with_pet',
  },
  {
    id: 'cleanAfterThePet',
    name: t('tasks.baseTasks.cleanAfterThePet'),
    description: t('tasks.baseTasks.cleanAfterThePetDescription'),
    picture: 'clean_pet_toilet',
  },
  {
    id: 'greetTheMorning',
    name: t('tasks.baseTasks.greetTheMorning'),
    description: t('tasks.baseTasks.greetTheMorningDescription'),
    picture: 'good_morning',
  },
  {
    id: 'sayGoodNight',
    name: t('tasks.baseTasks.sayGoodNight'),
    description: t('tasks.baseTasks.sayGoodNightDescription'),
    picture: 'good_night',
  },
  ];
};

type TaskImageKey = keyof typeof BASE_TASKS_IMAGES;

export const getTaskImageOptions = (): IImageOption[] => {
  const baseTasks = getBaseTasks();

  return (Object.keys(BASE_TASKS_IMAGES) as TaskImageKey[]).map(value => {
    const task = baseTasks.find(item => item.picture === value);

    return {
      label: task?.name ?? value,
      value,
      image: BASE_TASKS_IMAGES[value],
    };
  });
};