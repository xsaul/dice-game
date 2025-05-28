const readline = require('readline');
const crypto = require('crypto');
const AsciiTable3 = require('ascii-table');
const args = process.argv.slice(2);
let updatedDiceConfigs, randomIndex, usersDice, pcNumber, userSelectedNumber;
let round = 1;
let chosenDice = [];

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
    const secretKey = crypto.randomBytes(32).toString('hex');
    const hmac = crypto.createHmac('sha3-256', secretKey)
                                   .update(firstMove.toString()) 
                                   .digest('hex');
    console.log(`HMAC: ${hmac}`);
displayGuessMenu();
    function displayGuessMenu() {
        console.log("Choose an option:\n0. Guess 0\n1. Guess 1\n2. Help\n3. Exit");
        rl.question("Enter your guess: ", (choice) => {
            handleGuessSelection(choice);});}

    function handleGuessSelection(choice) {
        const selectedIndex = parseInt(choice);
        if (selectedIndex === 0 || selectedIndex === 1) {
            console.log("Generating the number...");
            setTimeout(() => {
                // const secretKey = crypto.randomBytes(32).toString('hex'); 
                console.log(`The result number: ${firstMove}\nHMAC: ${hmac}`);
                if (selectedIndex === firstMove) {
                    console.log(`Correct! You go first!`);
                    console.log(`\nSelect your dice:
${diceConfigs.map((sides, index) => `${index}. ${sides}`).join("\n")}
${diceConfigs.length}. Exit
${diceConfigs.length + 1}. Help`);
        rl.question("Your selection: ", (choice) => {
            handleUserSelection(choice);
        });
        updatedDiceConfigs = diceConfigs.filter(dice => dice !== choice);
         chosenDice = updatedDiceConfigs[Math.floor(Math.random() * updatedDiceConfigs.length)];
                } else {
                    chosenDice = diceConfigs[Math.floor(Math.random() * diceConfigs.length)];
                    updatedDiceConfigs = diceConfigs.filter(dice => dice !== chosenDice);
                    console.log(`Wrong! Computer goes first!\nComputer chose dice: [${chosenDice.join(", ")}]`);}
                console.log(`Secret Key for verification: ${secretKey}`);
                    console.log(`\nSelect your dice:
${updatedDiceConfigs.map((sides, index) => `${index}. ${sides}`).join("\n")}
${updatedDiceConfigs.length}. Exit
${updatedDiceConfigs.length + 1}. Help`);
        rl.question("Your selection: ", (choice) => {
            handleUserSelection(choice);
        });
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
}
determineFirstMove();

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
        console.log(`0. 0\n1. 1\n2. 2\n3. 3\n4. 4\n5. 5\n6. Exit\n7. Help`);
        rl.question("Your selection: ", (choice) => {
            handleSelection(choice);
            resolve();
        });});}
if (chosenDice.length > 0) {
    randomIndex = crypto.randomInt(0, chosenDice.length);
}
 pcNumber = chosenDice[randomIndex];
 function generateTable(values) {
    const headers = ['User dice v', ...values.map(row => row.join(','))];
    const tableData = values.map((row, i) => {
        const rowData = [row.join(',')];
        values.forEach((_, j) => {
            rowData.push(i === j ? '- (0.3333)' : ((i + j) / (values.length * 2)).toFixed(4));
        });
        return rowData;
    });
    const table = new AsciiTable3()
        .setHeading(...headers)
        .addRowMatrix(tableData);
    console.log(table.toString());
}
function handleSelection(choice) {
    const selectedIndex = parseInt(choice);
    if (selectedIndex >= 0 && selectedIndex < 6) {
        userSelectedNumber = selectedIndex;
    } else if (selectedIndex === 6) {
        console.log("Exiting the game. See you next time!");
        rl.close();
        return;
    } else if (selectedIndex === 7) {
        console.log("Help: Write the number you want to select.");
        generateTable(diceConfigs);
        userFaceSelection();
        return;
    } else {
        console.log("Invalid option. Please select a valid number.");
        userFaceSelection();
        return;
    }
    let randomNumber = crypto.randomInt(0, 5);
    const secretKey = crypto.randomBytes(32).toString('hex'); 
    console.log(`My number is: ${randomNumber}\nSecret Key: ${secretKey}`);
    console.log(`The fair number generation result is ${randomNumber} + ${userSelectedNumber} = ${(randomNumber + userSelectedNumber) % usersDice.length} (mod ${usersDice.length})`);
    if (round === 1) {
        pcNumber = (randomNumber + userSelectedNumber) % chosenDice.length;
        console.log(`My roll result is ${chosenDice[pcNumber]}`);
    } else if (round === 2) {
        userNumber = (randomNumber + userSelectedNumber) % usersDice.length;
        console.log(`Your roll result is ${usersDice[userNumber]}`);
    }
    userFaceSelection();
}
async function executeFunctions(times) {
    for (let i = 0; i < times; i++) {
        await generateRandomNumber();
        round++;}
    if(`${chosenDice[pcNumber]}` > userNumber) {
        console.log(`Computer wins this round! ${chosenDice[pcNumber]} > ${usersDice[userNumber]}`);
    } else if(`${chosenDice[pcNumber]}` < userNumber) {
        console.log(`You win this round! ${chosenDice[pcNumber]} < ${usersDice[userNumber]}`);
    }}