import { BASE_TASKS_IMAGES } from '~/assets/img/tasks/tasks';
import { t } from '~/services';
import { IImageOption } from '~/types';
import { ITaskBase } from '~/types/ITask';

export const getBaseTasks = (): ITaskBase[] => {
  // LocalizationService.initSync();

  return [
  {
    id: 'brush_teeth_evening',
    name: t('tasks.baseTasks.brushTeethEvening'),
    description: t('tasks.baseTasks.brushTeethEveningDescription'),
    picture: 'brush_teeth',
  },
  {
    id: 'brush_teeth_morning',
    name: t('tasks.baseTasks.brushTeethMorning'),
    description: t('tasks.baseTasks.brushTeethMorningDescription'),
    picture: 'brush_teeth',
  },
  {
    id: 'clean_desk',
    name: t('tasks.baseTasks.cleanDesk'),
    description: t('tasks.baseTasks.cleanDeskDescription'),
    picture: 'clean_desk',
  },
  {
    id: 'dirty_clothes_to_bin',
    name: t('tasks.baseTasks.dirtyClothesToBin'),
    description: t('tasks.baseTasks.dirtyClothesToBinDescription'),
    picture: 'dirty_clothes_to_bin',
  },
  {
    id: 'do_evening_exercises',
    name: t('tasks.baseTasks.doEveningExercises'),
    description: t('tasks.baseTasks.doEveningExercisesDescription'),
    picture: 'morning_exercises',
  },
  {
    id: 'do_homework',
    name: t('tasks.baseTasks.doHomework'),
    description: t('tasks.baseTasks.doHomeworkDescription'),
    picture: 'do_homework',
  },
  {
    id: 'do_morning_exercises',
    name: t('tasks.baseTasks.doMorningExercises'),
    description: t('tasks.baseTasks.doMorningExercisesDescription'),
    picture: 'morning_exercises',
  },
  {
    id: 'drink_a_glass_of_water',
    name: t('tasks.baseTasks.drinkAGlassOfWater'),
    description: t('tasks.baseTasks.drinkAGlassOfWaterDescription'),
    picture: 'drink_water',
  },
  {
    id: 'feed_the_pet',
    name: t('tasks.baseTasks.feedThePet'),
    description: t('tasks.baseTasks.feedThePetDescription'),
    picture: 'feed_pet',
  },
  {
    id: 'gather_clean_clothes',
    name: t('tasks.baseTasks.gatherCleanClothes'),
    description: t('tasks.baseTasks.gatherCleanClothesDescription'),
    picture: 'gather_clean_clothes',
  },
  {
    id: 'get_up_on_time',
    name: t('tasks.baseTasks.getUpOnTime'),
    description: t('tasks.baseTasks.getUpOnTimeDescription'),
    picture: 'get_up',
  },
  {
    id: 'go_to_bed_on_time',
    name: t('tasks.baseTasks.goToBedOnTime'),
    description: t('tasks.baseTasks.goToBedOnTimeDescription'),
    picture: 'go_to_bed',
  },
  {
    id: 'line_up_shoes',
    name: t('tasks.baseTasks.lineUpShoes'),
    description: t('tasks.baseTasks.lineUpShoesDescription'),
    picture: 'line_up_shoes',
  },
  {
    id: 'load_the_dishwasher',
    name: t('tasks.baseTasks.loadTheDishwasher'),
    description: t('tasks.baseTasks.loadTheDishwasherDescription'),
    picture: 'wash_dishes',
  },
  {
    id: 'make_bed',
    name: t('tasks.baseTasks.makeBed'),
    description: t('tasks.baseTasks.makeBedDescription'),
    picture: 'make_bed',
  },
  {
    id: 'pack_backpack',
    name: t('tasks.baseTasks.packBackpack'),
    description: t('tasks.baseTasks.packBackpackDescription'),
    picture: 'pack_backpack',
  },
  {
    id: 'prepare_clothes',
    name: t('tasks.baseTasks.prepareClothes'),
    description: t('tasks.baseTasks.prepareClothesDescription'),
    picture: 'prepare_clothes',
  },
  {
    id: 'put_away_toys',
    name: t('tasks.baseTasks.putAwayToys'),
    description: t('tasks.baseTasks.putAwayToysDescription'),
    picture: 'put_away_toys',
  },
  {
    id: 'spend_a_day_without_sweets',
    name: t('tasks.baseTasks.spendADayWithoutSweets'),
    description: t('tasks.baseTasks.spendADayWithoutSweetsDescription'),
    picture: 'day_without_sweets',
  },
  {
    id: 'sweep_floor',
    name: t('tasks.baseTasks.sweepFloor'),
    description: t('tasks.baseTasks.sweepFloorDescription'),
    picture: 'sweep_floor',
  },
  {
    id: 'take_out_trash',
    name: t('tasks.baseTasks.takeOutTrash'),
    description: t('tasks.baseTasks.takeOutTrashDescription'),
    picture: 'sweep_floor',
  },
  {
    id: 'take_shower',
    name: t('tasks.baseTasks.takeShooter'),
    description: t('tasks.baseTasks.takeShooterDescription'),
    picture: 'take_shower',
  },
  {
    id: 'tidy_up_pencil_case',
    name: t('tasks.baseTasks.tidyUpPencilCase'),
    description: t('tasks.baseTasks.tidyUpPencilCaseDescription'),
    picture: 'tidy_up_pencil_case',
  },
  {
    id: 'tidy_up_your_room',
    name: t('tasks.baseTasks.tidyUpYourRoom'),
    description: t('tasks.baseTasks.tidyUpYourRoomDescription'),
    picture: 'tidy_up_room',
  },
  {
    id: 'unload_the_dishwasher',
    name: t('tasks.baseTasks.unloadTheDishwasher'),
    description: t('tasks.baseTasks.unloadTheDishwasherDescription'),
    picture: 'wash_dishes',
  },
  {
    id: 'walk_the_dog',
    name: t('tasks.baseTasks.walkTheDog'),
    description: t('tasks.baseTasks.walkTheDogDescription'),
    picture: 'walk_the_dog',
  },
  {
    id: 'wash_your_hands',
    name: t('tasks.baseTasks.washYourHands'),
    description: t('tasks.baseTasks.washYourHandsDescription'),
    picture: 'wash_hands',
  },
  {
    id: 'wash_your_own_plate',
    name: t('tasks.baseTasks.washYourOwnPlate'),
    description: t('tasks.baseTasks.washYourOwnPlateDescription'),
    picture: 'wash_dishes',
  },
  {
    id: 'water_plants',
    name: t('tasks.baseTasks.waterPlants'),
    description: t('tasks.baseTasks.waterPlantsDescription'),
    picture: 'water_plants',
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