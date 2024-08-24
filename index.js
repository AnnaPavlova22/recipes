import express, { json } from "express";
import axios from "axios";
import bodyParser from "body-parser";


const app = express();
const port = 3000;
const API_URL = "https://themealdb.com/api/json/v1/1/";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        // Initial load can show a random recipe or a default page
        res.render("index.ejs", { ingredients: [], mealImage: "", mealName: "", mealCategory: "", mealInstruction: [] });
    } catch (error) {
        console.error("Error rendering page:", error);
        res.status(500).send("Error rendering page");
    }
});

app.post("/recipe", async (req, res) => {
    try {
        let result;

        // Check if the user clicked "Random choice" button or selected a category
        if (req.body.random !== undefined) {
            // Fetch a random recipe
            result = await axios.get(API_URL + "random.php");
        } else if (req.body.categories){
            // Fetch a recipe based on the selected category
            const choice = req.body.categories;
            const categoryResult = await axios.get(API_URL + "filter.php?c=" + choice);

            // Get the length of the meals array
            const mealsLength = categoryResult.data.meals.length;

            // Generate a random index within the range of the array
            const randomIndex = Math.floor(Math.random() * mealsLength);
            const mealId = categoryResult.data.meals[randomIndex].idMeal;

            // Get recipe by ID
            result = await axios.get(API_URL + "lookup.php?i=" + mealId);
        }

        // Extract the meal data from the API response
        const meal = result.data.meals[0];
        const mealName = meal.strMeal;
        const mealCategory = meal.strCategory;
        const mealInstruction = meal.strInstructions.split('\r\n').filter(p => p.trim() !== '');
        const mealImage = meal.strMealThumb;

        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push({ ingredient, measure });
            }
        }

        // Render the recipe
        res.render("index.ejs", { ingredients, mealImage, mealName, mealCategory, mealInstruction });

    } catch (error) {
        console.error("Error fetching recipe:", error);
        res.status(500).send("Error fetching recipe");
    }
});

app.listen(port, () =>{
    console.log(`Listening to port ${port}`);
});
