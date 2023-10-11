let debug = true;

const codeEditor = CodeMirror.fromTextArea(
  document.getElementById("codeEditor"),
  {
    lineNumbers: true,
    mode: "javascript",
    theme: "elegant",
    autoCloseBrackets: true,
    matchBrackets: true,
    autoIndent: true,
  }
);

if (localStorage.getItem("code")) {
  codeEditor.getDoc().setValue(localStorage.getItem("code"));
} else {
  const sample = `//Average of Two Number
DECLARE Num1, Num2 : INTEGER
OUTPUT "Please input a number"
INPUT Num1
OUTPUT "Please input another number"
INPUT Num2
OUTPUT "The rounded off average is:" , ROUND((Num1+Num2)/2) 

//Conditions
OUTPUT "Let's run some conditions"
IF Num1 > Num2
  THEN
    OUTPUT "Num1 is bigger"
  ELSE 
    OUTPUT "Num1 is smaller or equal to Num2"
ENDIF

//Loops
OUTPUT "Let's run some loops"
FOR Counter <- 2 TO 5 STEP 2
  output counter //All code is case insensitive for convenience
NEXT Counter

DECLARE Total : INTEGER //Variables are zero-initialized for convenience
WHILE Total < 5
  Total <- Total + 1	//Alternatively use = sign
ENDWHILE
OUTPUT Total

//Case
OUTPUT "Let's use a case statement"
CONSTANT myString <- "Ahmad"	//Constants can be declared like so
CASE OF myString
  "Hassan": OUTPUT "Blessed Child"
  "Raffay": OUTPUT "Unblessed Child"
  "Ahmad" : OUTPUT "Best Child"
  OTHERWISE OUTPUT "Unknown Child"
ENDCASE`;
  codeEditor.getDoc().setValue(sample);
}
function onSave() {
  localStorage.setItem("code", codeEditor.getValue());
}

$("#new").click(() => alert("This feature is a work in progress :P"));

let autorun = false;

$("#autorun").click(function () {
  if (autorun) {
    $("#autorun").removeClass("bg-back2");
    $("#autorun").addClass("bg-back");
    autorun = false;
  } else {
    $("#autorun").removeClass("bg-back");
    $("#autorun").addClass("bg-back2");
    $("#consolePane").animate({
      width: "40%",
      paddingLeft: "12px",
      paddingRight: "12px",
    });
    autorun = true;
    onExecute();
  }
});

codeEditor.on("change", (args) => {
  if (autorun) onExecute();
});

$("#bg2").hide();
$("#start").click(function () {
  $("#bg").animate(
    {
      width: "100%",
    },
    () => {
      $("#bg2").show();
      $("#version").hide();
      $("#homeTopPane").addClass("slideUp");
      $("#homeBottomPane").addClass("slideDown");
      setTimeout(() => {
        $("#homeTopPane").hide();
        $("#homeBottomPane").hide();
      }, 2000);
    }
  );
});

$("#run").click(() => {
  $("#consolePane").animate({
    width: "40%",
    paddingLeft: "12px",
    paddingRight: "12px",
  });
  onExecute();
});

/* -------------------------------------------------------------------------- */
/*                                      -                                     */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                    Stuff                                   */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                      -                                     */
/* -------------------------------------------------------------------------- */

function printPsuedo() {
  console.log(codeEditor.getValue());
}

function convertToLowerCaseExceptQuotes(inputString) {
  let result = "";
  let inSingleQuotes = false;
  let inDoubleQuotes = false;

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];

    if (char === "'" && !inDoubleQuotes) {
      // Toggle inSingleQuotes state
      inSingleQuotes = !inSingleQuotes;
    } else if (char === '"' && !inSingleQuotes) {
      // Toggle inDoubleQuotes state
      inDoubleQuotes = !inDoubleQuotes;
    }

    // Convert the character to lowercase if not in quotes
    if (!inSingleQuotes && !inDoubleQuotes) {
      result += char.toLowerCase();
    } else {
      result += char;
    }
  }

  return result;
}

function zeroValue(inputString) {
  if (inputString == "string") return ' = ""';
  if (inputString == "integer") return " = 0";
  if (inputString == "real") return "= 0.0";
  if (inputString == "boolean") return "= false";
  return "";
}

function tokenizeString(inputString) {
  const words = inputString.split(" ");
  let tokens = [];
  words.forEach((word, i) => {
    if (/[: , =]/.test(word)) {
      const splitArray = word.split(/(:|,|=)/g).filter(Boolean);
      tokens = tokens.concat(splitArray);
    } else {
      tokens.push(word);
    }
  });

  return tokens.filter((element) => element !== "");
}

// console.log(tokenizeString(`that is insane"`));

const boiler = "var dts = {}\n";
var output = boiler;

let consoleElm = document.getElementById("consolePane");

var errorState = false;
function err(error, line) {
  if (debug)
    console.error("Das a bad error: " + `${error}` + `\n @ line ${line}`);
  consoleElm.innerHTML = `<span class='text-red-700 mono'>  <b>Transpile-time error @ line ${line}: </b></br> ${error}</span>`;
  errorState = true;
}

function app(...args) {
  for (arg of args) {
    output += arg;
    output += "\n";
  }
}

function transpileCondition(inputString) {
  return inputString
    .replace(/or/gi, "||")
    .replace(/and/gi, "&&")
    .replace(/<>/gi, "!=")
    .replace(/=/gi, "==");
}

function div(a, b) {
  return parseInt(a / b);
}

function mod(a, b) {
  return a % b;
}

function length(inp) {
  return inp.length;
}

function ucase(inp) {
  return inp.toUpperCase();
}

function lcase(inp) {
  return inp.toLowerCase();
}

function substring(inp, a, b) {
  return inp.substring(a - 1, b);
}

function round(a) {
  return Math.round(a);
}
function random() {
  return Math.random();
}

function $OUTPUT$(...args) {
  for (arg of args) {
    consoleElm.innerHTML += arg.toString() + " ";
  }
  consoleElm.innerHTML += "</br>";
}
function $INPUT$(dataType) {
  return new Promise((res, rej) => {
    var input = document.createElement("input");
    // Set attributes for the input element
    input.placeholder = "Input some text";
    input.classList = "inp";
    input.autofocus = true;

    if (dataType == "integer") {
      input.type = "number";
      input.placeholder = "Input an integer";
    }
    if (dataType == "real") {
      input.type = "number";
      input.placeholder = "Input a real number";
    }
    if (dataType == "char") {
      input.placeholder = "Input a character";
    }

    // Attach an event listener (e.g., on input change)
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        input.readOnly = true;
        input.placeholder = event.target.value;
        if (debug)
          console.log("Enter key pressed. Input value: " + event.target.value);

        if (dataType == "integer") res(parseInt(event.target.value));
        else if (dataType == "real") res(parseFloat(event.target.value));
        else if (dataType == "char") res(event.target.value[0]);
        else res(event.target.value);
      } else if (dataType == "char" && event.target.value.length > 0 && event.key != "Backspace") event.preventDefault();
    });

    // Append the input to the container
    consoleElm.appendChild(input);
  });
}

function onExecute() {
  onSave();

  if (debug)
    console.log(
      "%c\n---------------------------------------------\n---------------  TRANSPILE  -----------------\n---------------------------------------------\n",
      "color: Cyan"
    );

  consoleElm.innerHTML = "";
  errorState = false;

  var curlyBraceCounter = {
    if: [0, 0],
    while: [0, 0],
    do: [0, 0],
    case: [0, 0],
    for: [0, 0],
  };
  var variableNames = [];
  var codeArray = codeEditor.getValue().split("\n");
  output = boiler;

  //loop thru each line of code

  function transpile(lineNum, line) {
    //preprocess the line of code
    // line = line.toLowerCase();
    line = line.replace(/\t/g, "");
    line = line.trim();
    line = line.replace(/<-/g, "=");
    if (line.includes("//")) {
      line = line.split("//")[0];
    }
    line = convertToLowerCaseExceptQuotes(line);

    words = line.split(" ");
    tok = tokenizeString(line);

    if (tok.length == 0) return; //continue if empty line

    switch (tok[0]) {
      //TODO Refactor with tokens instead of words
      case "declare":
        if (tok.indexOf(":") == -1)
          err(`Bad syntax for DECLARE statement. No : found`, lineNum);
        else {
          var varsList = "";
          for (let i = 1; i < tok.indexOf(":"); i++) varsList += tok[i];
          var varsArr = varsList.split(","); //variable names with spaces will get merged
          for (let varName of varsArr) {
            app(
              `var ${varName} ${zeroValue(line.split(":")[1].trim())}`,
              `dts["${varName}"] = "${line.split(":")[1].trim()}"`
            );
            variableNames.push(varName);
          }
        }
        break;

      case "constant":
        if (tok.indexOf("=") == -1)
          err(
            `Bad syntax for CONSTANT statement. No literal value found`,
            lineNum
          );
        else {
          let varName = tok[1];
          app(`var ${varName} = ${line.split("=")[1]}`);
        }
        break;

      case "output":
        if (line.length <= 6)
          err(`Bad Syntax for OUTPUT statement. No output value passed`);
        else app(`$OUTPUT$(${line.substring(7)})`);
        break;

      case "input":
        if (tok.length < 2)
          err(
            `Bad Syntax for INPUT statement. You probably forgot to mention the variable to pass the input into`,
            lineNum
          );
        else {
          let inputVars = line.substring(5).split(",");
          console.log("INPS");
          console.log(inputVars);
          for (let i = 0; i < inputVars.length; i++) {
            let inputVar = inputVars[i].trim();
            if (!variableNames.includes(inputVar))
              err(
                `Bad Syntax for INPUT statement. Variable name doesn't exist or variable is immutable/constant.`,
                lineNum
              );
            else {
              app(`${inputVar} = await $INPUT$(dts.${inputVar})`);
            }
          }
        }
        break;

      case "if":
        if (tok.length == 1)
          err("Bad Syntax for IF statement. No condition provided", lineNum);
        app(`if(${transpileCondition(line.substring(2))}){`);
        curlyBraceCounter.if[0]++;
        break;

      case "then":
        break;

      case "else":
        app("}else{");
        break;

      case "endif":
        app("}");
        curlyBraceCounter.if[1]++;
        break;

      case "while":
        app(
          `while(${transpileCondition(line.replace(/\b(while|do)\b/gi, ""))}){`
        );
        curlyBraceCounter.while[0]++;
        break;

      case "endwhile":
        app("}");
        curlyBraceCounter.while[1]++;
        break;

      case "repeat":
        app(`do{ `);
        curlyBraceCounter.do[0]++;
        break;

      case "until":
        app(`} while(${transpileCondition(line.substring(5))})`);
        curlyBraceCounter.do[1]++;
        break;

      case "case":
        if (!line.includes("case of"))
          err(
            "Bad syntax for CASE statement. You most likely forgot to write CASE OF",
            lineNum
          );
        app(`switch(${line.substring(7)}){`);
        curlyBraceCounter.case[0]++;
        break;

      case "otherwise":
        app(`default:\n`);
        transpile(lineNum, line.substring(9));
        app("break;");
        curlyBraceCounter.case[1]++;
        break;

      case "endcase":
        app(`}`);
        curlyBraceCounter.case[1]++;
        break;

      case "for":
        if (tok.length < 6) err("Bad syntax for FOR statement");
        let increment = 1;
        if (line.includes("step")) increment = tok[tok.length - 1];
        app(`dts["${tok[1]}"] = "INTEGER"`);
        app(
          `for(let ${tok[1]} = ${tok[3]}; ${tok[1]} ${
            increment > 0 ? "<=" : ">="
          } ${tok[5]}; ${tok[1]}+=${increment}){`
        );
        curlyBraceCounter.for[0]++;
        break;

      case "next":
        app(`}`);
        curlyBraceCounter.for[1]++;
        break;

      default:
        if (variableNames.includes(tok[0])) {
          if (tok[1] == "=") app(`${tok[0]} = ${line.split("=")[1]}`);
        } else {
          if (line.includes(":")) {
            app(`case ${line.split(":")[0]}:\n`);
            transpile(lineNum, line.split(":")[1]);
            app("\nbreak;");
          } else err("Uninterpretable keyword: " + tok[0], lineNum);
        }
        break;
    }
  }

  //transpile all lines
  for (let [lineNum, lineContent] of codeArray.entries()) {
    if (errorState) {
      break;
    }
    transpile(lineNum, lineContent);
  }

  //add some more boilerplate
  output = "let $MAIN$ = async ()=>{\n" + output + "\n}\n $MAIN$()";

  if (debug) console.log(output);

  if (!errorState) {
    //if no parsing error
    if (debug) console.log("LOOKS GOOD TO ME 👍");

    //Compile-time validation
    for (const [key, value] of Object.entries(curlyBraceCounter)) {
      if (value[0] != value[1]) {
        consoleElm.innerHTML = `<span class='text-red-700 mono'>  <b>Compile-time error: </b></br> Unpaired curly bracket. You most likely forgot to close a code block (e.g. by writing ENDIF or ENDWHILE) or forgot to properly create a code block (e.g. by writing THEN after IF or writing DO after WHILE)</span>`;
        executer = () => {};
        errorState = true;
      }
      console.log(`${key}: ${value}`);
    }

    if (!errorState) {
      //if no compiler-time error
      try {
        var executer = new Function(output);
      } catch (e) {
        if (debug) {
          console.error("dbas couldn't create new Function() with negus ");
          console.error(e);
        }
        consoleElm.innerHTML = `<span class='text-red-700 mono'>  <b>Uncaught compile-time error: </b></br> ${e}</span>`;
        executer = () => {};
      }
    }

    //EXECUTE CODE
    if (debug)
      console.log(
        "%c\n---------------------------------------------\n-----------------  EXECUTE  -----------------\n---------------------------------------------\n",
        "color: Cyan"
      );
    executer();
  }
}
