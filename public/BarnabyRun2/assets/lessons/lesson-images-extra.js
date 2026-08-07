(() => {
  const extraLessonImages = {
    boyRidingBike: "assets/lessons/new/boy-riding-bike.webp",
    girlWateringFlowers: "assets/lessons/new/girl-watering-flowers.webp",
    childrenBuildingSandcastle: "assets/lessons/new/children-building-sandcastle.webp",
    manWashingCar: "assets/lessons/new/man-washing-car.webp",
    womanTakingPhoto: "assets/lessons/new/woman-taking-photo.webp",
    rabbitEatingCarrot: "assets/lessons/new/rabbit-eating-carrot.webp",
    ducksSwimming: "assets/lessons/new/ducks-swimming.webp",
    grandparentsPlantingTree: "assets/lessons/new/grandparents-planting-tree.webp"
  };

  Object.assign(window.__BARNABY_LESSON_IMAGES ||= {}, extraLessonImages);

  Object.values(extraLessonImages).forEach((src) => {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
  });
})();
