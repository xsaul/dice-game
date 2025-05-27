const readline = require('readline');
const crypto = require('crypto');
const AsciiTable3 = require('ascii-table');
const args = process.argv.slice(2);
let updatedDiceConfigs;
let chosenDice;
let usersDice;
let round = 1;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (args.length < 3) {
    console.error("Error: You must provide at least three dice configurations.");
    process.exit(1);
}

const diceConfigs = args.map(config => { 
    const values = config.split(',').map(Number);
     if (values.some(isNaN)) { 
        console.error(`Error: Invalid dice configuration "${config}". Remember all the values must be numbers.`); 
        process.exit(1);}
         if (values.length < 6) { 
            console.error(`Error: Each dice must have at least 6 sides. Invalid configuration: "${config}".`); 
            process.exit(1); } 
            return values; });
console.log("Dice configurations loaded successfully:", diceConfigs);

function determineFirstMove() {
    console.log("Let's determine who goes first...");
    const firstMove = crypto.randomInt(0, 2);
    chosenDice = diceConfigs[Math.floor(Math.random() * diceConfigs.length)];
    updatedDiceConfigs = diceConfigs.filter(dice => dice !== chosenDice);

    function displayGuessMenu() {
        console.log("Choose an option:\n0. Guess 0\n1. Guess 1\n2. Help\n3. Exit");
        rl.question("Enter your guess: ", (choice) => {
            handleGuessSelection(choice);});}

    function handleGuessSelection(choice) {
        const selectedIndex = parseInt(choice);
        if (selectedIndex === 0 || selectedIndex === 1) {
            console.log("\nGenerating the number...");
            setTimeout(() => {
                const secretKey = crypto.randomBytes(32).toString('hex'); 
                const hmac = crypto.createHmac('sha3-256', secretKey)
                                   .update(firstMove.toString()) 
                                   .digest('hex');
                console.log(`The result number: ${firstMove}\nHMAC: ${hmac}`);
                if (selectedIndex === firstMove) {
                    console.log(`Correct! You go first!\nComputer chose dice: [${chosenDice.join(", ")}]`);
                } else {
                    console.log(`Wrong! Computer goes first!\nComputer chose dice: [${chosenDice.join(", ")}]`);}
                console.log(`Secret Key for verification: ${secretKey}`);
                setTimeout(() => {
                    displayChooseMenu();
                }, 1500);
            }, 1000);
        } else if (selectedIndex === 2) {
            console.log("Help: Choose '0' or '1' to make your guess. The computer will fairly decide who goes first.");
            displayGuessMenu();
        } else if (selectedIndex === 3) {
            console.log("Exiting the game. See you next time!");
            rl.close();
        } else {
            console.log("Invalid option. Please select a valid number.");
            displayGuessMenu();
        }}
    displayGuessMenu();
}
determineFirstMove();

function displayChooseMenu() {
    console.log(`\nSelect your dice:
${updatedDiceConfigs.map((sides, index) => `${index}. ${sides}`).join("\n")}
${updatedDiceConfigs.length}. Exit
${updatedDiceConfigs.length + 1}. Help`);
        rl.question("Your selection: ", (choice) => {
            handleUserSelection(choice);
        });
}

function handleUserSelection(choice) {
    const selectedIndex = parseInt(choice);
    if (selectedIndex >= 0 && selectedIndex < updatedDiceConfigs.length) {
        usersDice = updatedDiceConfigs[selectedIndex];
        console.log(`You selected dice: [${usersDice.join(", ")}]`);
        setTimeout(() => {
            executeFunctions(2);
        }, 1000);
    } else if (selectedIndex === updatedDiceConfigs.length) {
        console.log("Help: Write '1' or '2' to choose a dice.");
        displayChooseMenu();
    } else if (selectedIndex === updatedDiceConfigs.length + 1) {
        console.log("Exiting the game. See you next time!");
        rl.close();
    } else {
        console.log("Invalid option. Please select a valid number.");
        displayChooseMenu();
    }}

async function generateRandomNumber() {
    if (!usersDice) {
        console.error("Error: usersDice is not set. Function execution halted.");
        return;}
    if (round === 1) {
        console.log("It's time for my roll \nGenerating a random number between 0 and 5");
    } else {
        console.log("It's time for your roll \nGenerating a random number between 0 and 5");}
    const randomNumber = crypto.randomInt(0, 5);
    const secretKey = crypto.randomBytes(32).toString('hex'); 
    const hmac = crypto.createHmac('sha3-256', secretKey)
                       .update(randomNumber.toString()) 
                       .digest('hex');
    console.log(`HMAC: ${hmac}\nAdd your number modulo ${usersDice.length}`);
    await userFaceSelection();
}
async function userFaceSelection() {
    return new Promise(resolve => {
        console.log(`Select your face:
${usersDice.map((face, index) => `${index}. ${face}`).join("\n")}
${usersDice.length}. Help
${usersDice.length + 1}. Exit`);
        rl.question("Your selection: ", (choice) => {
            handleSelection(choice);
            resolve();
        });});}
let randomIndex = crypto.randomInt(0, chosenDice.length);
let pcNumber = chosenDice[randomIndex];
let userSelectedNumber;
function handleSelection(choice) {
    const selectedIndex = parseInt(choice);
    if (selectedIndex >= 0 && selectedIndex < usersDice.length) {
        console.log(`Your selected face: [${usersDice[selectedIndex]}]`);
         userSelectedNumber = usersDice[selectedIndex];
    } else if (selectedIndex === usersDice.length) {
        console.log("Help: Write the number of the face you want to select.");
function calculateWinProbability(usersDice, chosenDice) {
    let userWins = 0;
    let totalOutcomes = usersDice.length * chosenDice.length;
    let probabilityTable = [];
    for (let userFace of usersDice) {
        for (let opponentFace of chosenDice) {
            if (userFace > opponentFace) {
                userWins++;}}
        let probability = (userWins / totalOutcomes) * 100;
        probabilityTable.push([userFace, userWins, totalOutcomes, probability.toFixed(2) + "%"]);}
    return probabilityTable;
}

const table = new AsciiTable3()
    .setHeading('Face', 'Wins', 'Total Outcomes', 'Win Probability')
    .addRowMatrix(calculateWinProbability(usersDice, chosenDice));
console.log(table.toString());
return userFaceSelection();
    } else if (selectedIndex === usersDice.length + 1) {
        console.log("Exiting the game. See you next time!");
        rl.close();
    } else {
        console.log("Invalid option. Please select a valid number.");
        userFaceSelection();}
    let randomNumber = crypto.randomInt(0, 5);
    const secretKey = crypto.randomBytes(32).toString('hex'); 
    console.log(`My number is: ${randomNumber}\nSecret Key: ${secretKey}`);
    console.log(`The fair number generation result is ${randomNumber} + ${userSelectedNumber} = ${randomNumber + userSelectedNumber % usersDice.length} (mod ${usersDice.length})`);
    if (round === 1) {
        console.log(`My roll result is ${pcNumber}`);
    } else if (round === 2) {
        userNumber = (randomNumber + userSelectedNumber) % usersDice.length;
        console.log(`Your roll result is ${userNumber}`);
    }}

async function executeFunctions(times) {
    for (let i = 0; i < times; i++) {
        await generateRandomNumber();
        round++;}
    if(pcNumber > userNumber) {
        console.log(`Computer wins this round! ${pcNumber} > ${userNumber}`);
    } else if(pcNumber < userNumber) {
        console.log(`You win this round! ${pcNumber} < ${userNumber}`);
    }}