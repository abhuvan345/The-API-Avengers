// Simple test script to check crop plan functionality
console.log("Testing crop plan endpoint...");

fetch("http://localhost:5002/crop-plan/wheat")
  .then((response) => response.json())
  .then((data) => {
    console.log("Wheat plan loaded:", data.success);
    if (data.success) {
      console.log("Crop name:", data.crop_plan.name);
      console.log("Duration:", data.crop_plan.duration_days, "days");
      console.log("Stages:", data.crop_plan.stages.length);
    }
  })
  .catch((error) => console.error("Error:", error));
