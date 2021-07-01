const mainContainer = document.getElementById("main-div");
const mealHtmlElement = document.getElementById("meals");
const favListContainer = document.getElementById("fav_list");
const inputField = document.getElementById("inputId");

//search by term
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {
	const inputSearchBarValue = document.getElementById("inputId").value;
	//console.log(inputSearchBarValue);
	
	//proveri vrednost unetu u polje search. Ako je prazno obavesti!
	if (inputSearchBarValue === '') {
		//alert("Insert the name of the meal!");
		errorFunction();
	} else {
		clearTheMainContent();
		//prosledi ovoj funkciji unetu vrednost iz polja INPUT
		getMealsBySearchFromAPI(inputSearchBarValue);	
	}
});
//


getRandomMealFromAPI();
fetchAndAddRemFavMealsToCont();


//main functions for API
async function getRandomMealFromAPI(){
	const respons = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
	
	const responsData = await respons.json();
	const randomMeal = responsData.meals[0];//uzmi prvi arrey
	//console.log(randomMeal);

	//prosledjujem var randomMeal
	showRandomMealInCont(randomMeal, true);
}

async function getMealByIdFromAPI(id){
	const respons = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
	
	const responsData = await respons.json();
	const oneMeal = responsData.meals[0];
	//console.log(oneMeal);
	return oneMeal;
}

async function getMealsBySearchFromAPI(term){
	const respons = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
	//console.log(respons);

	const responsData = await respons.json();
	console.log(responsData.meals);

	//
	if (responsData.meals === null) {
		alert("No meal in the database!");
		
		//ako je u pretragu pogresno upisano ime jela obavesti i učitaj novo random jelo.
		getRandomMealFromAPI();
	} else {
		
		const oneSearchMealData = responsData.meals[0];
		//console.log(oneSearchMealData);
	
		//prosledjujem podatke jednog pretrazenog jela
		showRandomMealInCont(oneSearchMealData, true);
	}


}


//clear the main content where meals are displayed
function clearTheMainContent(params) {
	const clearContent = document.getElementById('meals');

	clearContent.innerHTML = '';
}

//add meal function to random DIV in app
function showRandomMealInCont(mealData, random = false){
	const meal = document.createElement('div');
	meal.classList.add('meal');	
	meal.innerHTML = `
				<div class="meal-header">${random ? `<span class="random">Random Recipes</span>` : ''}
				<img src="${mealData.strMealThumb}" 
				alt="${mealData.strMeal}"></div>
				<div class="meal-body">
					<h4>${mealData.strMeal}</h4>
					<button class="fav-btn" id="btn">
					<i class="fa fa-heart" aria-hidden="true"></i></button>
				</div>`
	
	//on click(button) add random recipe to LOCAL STORAGE and to fav container
	const btn = meal.querySelector('.meal-body .fav-btn');
	btn.addEventListener("click", () => {
		//console.log("test");
		if(btn.classList.contains("active")){
			removeMealFromlLS(mealData);
			btn.classList.remove("active");
		} else{
			addMealToLS(mealData);
			btn.classList.add("active");
		}

		//add/remove meals from fav container
		fetchAndAddRemFavMealsToCont();

		//refresh random container with new random meal
		meal.innerHTML = '';

		//nakon što se doda random jelo u favorites, učitaj novo random jelo.
		getRandomMealFromAPI();
	});

	//elementu iz HTML fajla, dodaj element koji sam prethodno kreirao
	mealHtmlElement.appendChild(meal);
	
}

/////////////////////////////////////////////local storage functions/////////////////////////////////////////////////
function addMealToLS(mealData){
	const mealIds = getMealFromLS();

	localStorage.setItem("idMeal", JSON.stringify([...mealIds, mealData.idMeal]));
	
	//console.log(localStorage);
}

function removeMealFromlLS(mealData){
	const mealIdsFromLs = getMealFromLS();
	//console.log(mealData);
	//console.log(mealData.idMeal);

	//ponovo postavi podatke ali samo one koji su razliciti od prethodno dodatog ID-ja u nizu (array) mealIds.filter((id) => id !== mealData.idMeal))
	//removeItem ne moze jer se pomocu toga brisu svi podaci iz LS.
	localStorage.setItem("idMeal", JSON.stringify(mealIdsFromLs.filter((id) => id !== mealData)));

	//console.log(localStorage);
}

function getMealFromLS(){
	const getMealIds = JSON.parse(localStorage.getItem("idMeal"));
	//console.log(getMealIds);

	return getMealIds === null ? [] : getMealIds;
}
////////////////////////////////////////////////


async function fetchAndAddRemFavMealsToCont(){
	//clean fav container
	favListContainer.innerHTML = '';

	//ovde uzimamo rezultat iz funkcije getMealFromLS() a to je array sa id-vima koji su već smešteni u local storage odnosno u favorite container
	const mealIdFromLS = getMealFromLS();
	//console.log(mealIdFromLS);

	//
	for (let i = 0; i < mealIdFromLS.length; i++) {
		//u ovu varijablu ubaci ID jela svaki put kada loop prođe
		const mealId = mealIdFromLS[i];
		//console.log(mealIdFromLS[i]);

		//
		oneMeal = await getMealByIdFromAPI(mealId);
		//console.log(oneMeal);

		addRemMealFavCont(oneMeal);
	}


}

//add fav meal function
function addRemMealFavCont(mealData){
	//kreiraj html li element
	const favBarList = document.createElement("li");

	// u njega dodaj html img i span elemente
	favBarList.innerHTML = `<img src="${mealData.strMealThumb}" 
						alt="${mealData.strMeal}">
						<span>${mealData.strMeal}</span>
						<button class="rmvBtn">
						<i class="fa fa-window-close-o" aria-hidden="true"></i>
						</button>`;
	
	//u html element (koji je ubacen u varijablu po ID-ju) ubaci prethodne elemente
	favListContainer.appendChild(favBarList);

	//delete fav meal from fav cont
	const removeBtn = favBarList.querySelector('.rmvBtn');
	removeBtn.addEventListener("click", () => {
		removeMealFromlLS(mealData.idMeal);

		fetchAndAddRemFavMealsToCont();
	});	
}

function errorFunction() {
	const errorElement = document.createElement('div');
	errorElement.classList.add('error-style');

	const closeError = errorElement.querySelector('.error-style');

	if (closeError.style.display === "none") {
	//ubaci elemente u div za error 		
		errorElement.innerHTML = `
		<p>Unesite ispravno ime jela!</p>
		<button class="rmvBtn">
			<i class="fa fa-window-close-o" aria-hidden="true"></i>
		</button>`
		console.log("test1")
	//zakljucaj unos u polje
	inputField.disabled = true;

	mainContainer.appendChild(errorElement);

	} else {
		console.log("test2")
		errorElement.style.display = "none";
	}
	
}