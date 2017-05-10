// <script> Version 1.9

var histAction = new Array(0);
var histInput = new Array(0);
var recall;

function control(action,form,recall) {
// This function provides the unique bridge between the html-page,
// which mainly serves for input and output (presentation) here, and the dynamics
// provided by the remaining functions. It enables functions based on the interaction history (non-url based,
// this in contrast with the document history-object).
// 
// (Currently, the HTML-page also has a database function for the LPA text.
// Ideally, XML should take care of this structured content. But I found no easy way to
// handle HTML embedded in XML with JavaScript, and I do not want to use XSLT as an extra source of dynamics.)
//
// TO DO:
// + put embedded "back" and "forth" functions here, including the now global histAction and histForm arrays).

var number = form.input.value;

//alert(number);
            
	// store current action and input, if recall is true
	// (For actions coming from the "back" function, recall is false)
            if (recall) {
		histAction.push(action);
            	histInput.push(number);
	    };

	// empty the field where the result of the action is presented
	clearOutput();

	// execute the action given the input
	    switch (action) {
        case "getFirst": getFirst()
        break
        case "getThesis": getThesis(number)
	    break
	    case "getParent": getParent(number)
	    break
	    case "getInfants": getInfants(number)
	    break
	    case "getAdolescents": getAdolescents(number)
	    break
	    case "getChildren": getChildren(number)
	    break
	    case "getOffspring": getOffspring(number)
	    break
	    case "getPrevSibling": getPrevSibling(number)
	    break
	    case "getNextSibling": getNextSibling(number)
	    break
	    case "getPrevThesis": getPrevThesis(number)
	    break
	    case "getNextThesis": getNextThesis(number)
	    break
	    case "getPreamble": getPreamble(number)
	    break
	    case "getAll": getAll()
	    break
	    case "getMain": getMain()
	    break
 	    case "getHelp": getHelp()
	    break
	    case "doSearch": doSearch()
	    break
	    default: getFirst()
	    }; 
	
	recall = true;
}

function back() {
// This function restores a previous state by repeating the previous action on the previous input
// (stored one before last in the histAction and histForm respectively). The form-field is updated
// with the previous value. The back-function can be repeated, circuling through the history-arrays.

	var prevAction = "";
	var prevInput = "";

	if (histAction.length > 1) {

		// swap the last values of the history-arrays
		// to the beginning
		prevAction = histAction.pop();
		prevInput = histInput.pop();
		histAction.unshift(prevAction);
		histInput.unshift(prevInput);
		// the previous action and parameter are now the last values
		prevAction = histAction[histAction.length-1];
		prevInput = histInput[histInput.length-1];
		// update the inputfield and do the previous action
		setInput(prevInput);
		control(prevAction,document.form,false);

	} else {
		// notify the user there is no history
		clearOutput();
		throwException("hist");
	}

}

function forth() {
// This function goes to the next state by performing the next action on the next parameter
// (stored at the beginning of historyAction and historyForm respectively [circular approach]).
// Also, the form-field is updated with  the next value. All in all, this makes that the forth-function can be repeated.

	var nextAction = "";
	var nextInput = "";

	if (histAction.length > 1) {

		// swap the first values of the history-arrays
		// to the end
		nextAction = histAction.shift();
		nextInput = histInput.shift();
		histAction.push(nextAction);
		histInput.push(nextInput);
		// the next action and parameter are now the last values
		nextAction = histAction[histAction.length-1];
		nextInput = histInput[histInput.length-1];
		// update the inputfield and do the next action
		setInput(nextInput);
		control(nextAction,document.form,false);
	} else {
		// notify the user there is no history
		clearOutput();
		throwException("hist");
	}

// TO DO:
// + Add a forth-function.
}

function getThesis(number) {
// This function fetches thesis <number>.

	// if the input has the form of a thesis-number (notified if not)
	if ( checkInput(number) != null ) {
		// recast number as regexp
		var regexp = new RegExp("^" + number + "$");
		doThesisSearch("getThesis",regexp);
 	}
}

function getInfants(number) {
// This function fetches thesis <number> and its infants;
// An infant is a child with number of form: <number>, one or more zero's, a non-zero digit.

   	// if the input has the form of a thesis-number (notified if not)
	if ( checkInput(number) != null ) {
		// generate regular expression from <number>
		// regexp's first alternative is for the main thesis (with dot-less numbers), the second for the rest
		if (number.length > 1) {
			var regexp = new RegExp("^" + number + "$|^" + number + "00*[1-9]$");}
		else {
			var regexp = new RegExp("^" + number + "$|^" + number + ".00*[1-9]$");
		};
		doThesisSearch("getInfants",regexp);
  	}
}

function getAdolescents(number) {
// This function fetches thesis <number> and its adolescents.
// An adolescent is a child with number of form: <number>, a non-zero digit.
// alert("Number is: " + number);

   	// if the input has the form of a thesis-number (notified if not)
	if ( checkInput(number) != null ) {
		// generate regular expression from <number>
		// regexp's first alternative is for the main thesis (with dot-less numbers), the second for the rest
		if (number.length > 1) {
		 	var regexp = new RegExp("^" + number + "$|^" + number + "[1-9]$");}
		else {
		 	var regexp = new RegExp("^" + number + "$|^" + number + ".[1-9]$");
		};
		doThesisSearch("getAdolescents",regexp);
  	}
}

function getChildren(number) {
// This function fetches thesis <number> and its children.
// A child is an immediate successor in the tree-order; it is an infant or an adolescent
	
	// if the input has the form of a thesis-number (notified if not)
	if ( checkInput(number) != null ) {
		// generate regular expression from <number>
		// regexp's first alternative is for the main thesis (with dot-less numbers), the second for the rest
		// var regexp = new RegExp("^" + number + "$|^" + number + ".0*[1-9]$|^" + number + "0*[1-9]$");
		if (number.length > 1) {
			var regexp = new RegExp("^" + number + "$|^" + number + "0*[1-9]$");}
		else {
			var regexp = new RegExp("^" + number + "$|^" + number + ".0*[1-9]$");
		};
		doThesisSearch("getChildren",regexp);
  	}

}

function getOffspring(number) {
// This function fetches the offspring of thesis <number>
// Offspring consists of thesis <number> and all thesis below it in tree order.

	// if the input has the form of a thesis-number (notified if not)
	if ( checkInput(number) != null ) {
		// generate regular expression from <number>
		var regexp = new RegExp("^" + number);
		doThesisSearch("getOffspring",regexp);
  	}
}

function getParent(number) {
// This function fetches the parent of thesis <number>
  
   // if the input has the form of a thesis-number (notified if not)
   if ( checkInput(number) != null ) {

	// Is thesis <number> a main thesis?
   	if (number.match(/^[0-9]$/) != null)
   	{ 	
		// if so, notify the user there is no parent			
		throwException("getParent");
   	}
	else if (number.match(/00*[1-9]{1}$/) != null) {
		// in case thesis <number> is an infant, remove intermediate zero's and last digit
		pNumber = number.replace(/00*[1-9]{1}$/,"");
		// remove final dot in case there is one
		pNumber = pNumber.replace(/\.$/,"");
		// update inputfield
		setInput(pNumber);
		// cast regexp and search
                var regexp = new RegExp("^" + pNumber + "$");
		doThesisSearch("getParent",regexp);
   	} else {
      		// in case thesis <number> is an adolescent remove last digit
		pNumber = number.replace(/[1-9]{1}$/,"");
		// remove final dot in case there is one
		pNumber = pNumber.replace(/\.0*$/,"");
		// update inputfield
		setInput(pNumber);	
		// cast regexp en search
		var regexp = new RegExp("^" + pNumber + "$");
		doThesisSearch("getParent",regexp);
   	}
   }
}

function getPrevSibling(number) {
// This function fetches the previous sibling of thesis <number> in the tree-order

   // if the input has the form of a thesis-number
   // (notified if not)
   if ( checkInput(number) != null ) {
	
	// determine prefix of the siblingnumber
	pNumber = number.replace(/[1-9]{1}$/,"");
	// determine postfix of sibling-number by subtracting 1 from the last digit of <number>
	// ( due to the checkInput, the last digit is greater than 0 )
	newInd = parseInt(number.match(/[1-9]{1}$/)) - 1;
	// form number by concatenating prefix and new postfix
	sibNumber = pNumber + newInd;
	// update inputfield
	setInput(sibNumber);
	// fetch previous sibling
      	getThesis(sibNumber);
		
   }
}

function getNextSibling(number) {
// This function fetches the next sibling of thesis <number> in the tree-order

   // if the input has the form of a thesis-number
   // (notified if not)
   if ( checkInput(number) != null ) {

	// determine prefix of the siblingnumber
	pNumber = number.replace(/[0-9]{1}$/,"");
	// check whether the successor of the last digit is still a single digit
	if ( parseInt(number.match(/[0-9]{1}$/)) < 9 ) {
		// determine postfix of sibling-number by adding 1 to the last digit of <number>
		newInd = parseInt(number.match(/[0-9]{1}$/)) + 1;
		// form number by concatenating prefix and new postfix
		sibNumber = pNumber + newInd;
		// update inputfield
      		setInput(sibNumber);
		// fetch next sibling
		getThesis(sibNumber);
	}
   	
   }
}

function getPrevThesis(number)
// this function displays the previous thesis in the sequential order if there is one,
// else it is notified there is none
{
   // to enable an exception of input is no existing thesisnumber
   var found = 0;

   // if the input has the form of a thesis-number
   // (notified if not)
   if ( checkInput(number) != null ) {
	
	// start search
	var nodes = document.getElementsByTagName("div"); 
  	for (var i=0;i<nodes.length;i++)
   	{
		// obtain thesis-number
		thNo = nodes.item(i).getAttribute("id");
		
		// is it the number looked for?
		if (number == thNo) {
			found++;
			// if so, does it have a predecessor?
                        // (first thesis div-element has index 5 in array, whence "-5")
			if (i-5 > 0) {
				// fetch number
				number = nodes.item(i-1).getAttribute("id");
				// keep inputfield on page in sync with the current action
				setInput(number);
				// get the predecessor
	   			getThesis(number);
				// quit for-loop
                                break;
			} else {
				// else state there is no predecessor	   			
				throwException("getPrevThesis");
  		        }
		}
	};
    }
    if (found == 0) {
	//state there is no such thesis
	clearOutput();
	throwException("getThesis");
    }

}

function getNextThesis(number) {
// this function displays the next thesis in the sequential order, if there is one
// else it is notified there is none
    
   // to enable an exception of input is no existing thesisnumber
   var found = 0;

   // if the input has the form of a thesis-number? (notified if not)
   if ( checkInput(number) != null ) {

	// start search
	var nodes = document.getElementsByTagName("div"); 
  	for (var i=0;i<nodes.length;i++) {
		thNo = nodes.item(i).getAttribute("id");
		
		// is it the number looked for?
		if (number == thNo) {
			found++;
			// if so, does it have a successor?
			if (i+1 < nodes.length) {
				// fetch number
				number = nodes.item(i+1).getAttribute("id");
				// keep inputfield on page in sync with the current action
				setInput(number);
				// get the successor
	   			getThesis(number);
				// quit for-loop
				break;
			} else {
				// else state there is no successor
				throwException("getNextThesis");
  			}
		}
	}
    };
    if (found == 0) {
	//state there is no such thesis
	clearOutput();
	throwException("getThesis");
    }
}

function doThesisSearch(action,regexp) {
// This function is the core of searching theses, which is done on the basis of their numbers using regular expressions.
// The <action> prepares the appropriate regular expression. The <action>-name is used to select the approriate exception
// if nothing is found.

var thNo;

// to count the number of theses found
var found = 0; 

// start search by selecting the candidate chuncks of information
// the searchspace is taken as liberal as possible
// (as yet, no performance-penalty noted)
var nodes = document.getElementsByTagName("div");

// count the total-number of theses. 
// (to ensure that the script is independent mistakes in the text database)
var total = nodes.length - 5; // The number of divs before the tail of thesis-divs is 5.

// start building the result-table
var resultTable = "<table border=\"0\">";

// start checking each chunk of information
for (var i=0;i<nodes.length;i++) {
	// fetch the thesisnumber
	// ("attributes["class"].nodeValue" should be "getAttribute("class")", IE6 however...)
	thNo = nodes.item(i).getAttribute("id"); //nodes[i].attributes["id"].nodeValue; 
	// if the thesisnumber matches, count the finding and add it to the result-table
	if (regexp.test(thNo)) {
		found++;
		resultTable += getRow(thNo,nodes[i]);
	};
 };

// close result table
resultTable += "</table>";

// is anything found?
if ( found > 0 ) {
	// if so, render output
	output(resultTable);
} else {
	// else notify the user
	throwException(action);
};

// prepare and render description of search-result
// percentage = Math.round(found/total * 10000) / 100;
// var searchDescription = "<p><i>Search completed. " + found  + " out of " + total + " (" + percentage +  "%)</i></p>";
// output(searchDescription);
}



function getMain() {
// This function displays the 7 main theses


  clearOutput();

  // start building the resulttable
  var table = "<table border=\"0\">";
  for (var i = 1;i < 8; i++) {
	
	// add each main thesis
	id = i + "";
	table += getRow(id,document.getElementById(id));
  }
  
  // close resulttable and render it
  table += "</table>";
  output(table);
  // keep input in sync
  setInput(1);

}

function getAll() {
// This function displays all theses

    clearOutput();

    // start building the resulttable
    // separate preamble and text with a blank rule
    var blank = "<tr><td>&nbsp;</td><td>&nbsp;</td></tr>";
    var resultTable = blank + "<table border=\"0\">";

    // start search
    var nodes = document.getElementsByTagName("div"); 
    for (var i=0;i<nodes.length;i++) {
        
        // look for theses only
        if (nodes[i].attributes["class"].nodeValue == "thesis"){
		// fetch thesisnumber
                thNo = nodes[i].attributes["id"].nodeValue;
		// add thesis to resulttable
		resultTable += getRow(thNo,nodes[i]);
	};
    };

    
    // close resulttable and render it
    resultTable += "</table>";
    output(resultTable);		 

}

function getFirst() {
    // This function displays the introduction with the main ideas behind this site
    
    clearOutput();
    output(document.getElementById("main").innerHTML);
}

function getHelp() {
// This function displays the introduction with the main ideas behind this site

    clearOutput();
    output(document.getElementById("help").innerHTML);
}

function getPreamble() {
// This function displays the motto's and the introduction

    clearOutput();
    output(document.getElementById("prmbl").innerHTML);
}

function doSearch() {
// This function searches for matches with the thesisnumber and -text for each regular expression in the conjunction of the input (separated by '&').
// Firstly, it puts the conjuncts from the input in the array <regexparr>.
// Secondly, it starts creating a tabel with the search results. This table also gives information on
// (i) the expressions searched for,
// (ii) the number  of successes, 
// (iii) the number of theses skipped between successes.
//alert("searching");
    var thNo, flag;
    var total = 0; // count the total number of theses (to ensure that the scipt doesn't depend on mistakes in the database)
    var found = 0; // counts the number of theses found
    var delta = 0; // used with var t to determine the number of theses skipped
    var t = 6; // number of divs before the thesis-divs is 5. So first thesis div-element has index 5 in array. Var t is used to determine the number of theses skipped
    
    // store the input, i.e., a sequence of regular expressions separated by '&', in the array <regexparr>.
      var regexps = document.form.input.value + " ";
      regexps = regexps.replace(/ */g,""); // remove all spaces (i.e., use '\s' or '\b' to search for spaces)
      var regexparr = regexps.split(/&/g); // split on conjunction to put regexps in an array;

    // start building the result-table
    var blank = "<tr><td>&nbsp;</td><td>&nbsp;</td></tr>";
    var table = "<table border=\"0\">" + blank; // open table

    // start search
    var nodes = document.getElementsByTagName("div"); 
    for (var i=0;i<nodes.length;i++) {
        
        // look for theses only
        if (nodes[i].attributes["class"].nodeValue == "thesis"){
		total++; // count the number of theses
                            thNo = nodes[i].attributes["id"].nodeValue; // fetch the thesisnumber

                           // check whether all regular expression match the current thesis(number). If so <flag> is true, else false
		flag = true;
		for (var j = 0; j < regexparr.length; j++){
			regexp = new RegExp(regexparr[j],"gi");
			if ( flag && (regexp.test(nodes[i].innerHTML) || regexp.test(thNo))){flag = true} else {flag = false};
		               // N.B.: the simpler "flag = regexp.test(nodes[i].innerHTML) && flag" doesn't seem to work
		};

                            // if all regxps match
		if(flag) {
			// count the number of theses found
                                          found++;
			
			// if theses are ommitted, determine their number in <delta> and state how many in the result-table
			if ( i >= t ) {
				delta = (i-t);
				if (delta == 1) { //in case of a delta, distinguish between plural and singular for the statement in the result-table
					table += blank + "<tr><td halign=\"right\">&ndash;&ndash;&ndash;&ndash;&ndash;&ndash;</td><td><i>" + delta + " thesis skipped.</i></td>";				} else if (delta > 1) { 
					table += blank + "<tr><td halign=\"right\">&ndash;&ndash;&ndash;&ndash;&ndash;&ndash;</td><td><i>" + delta + " theses skipped.</i></td>";	
				};			} 
			table += getRow(thNo,nodes[i]);
			t = i+1; 
		};
	};
    };
    table += "</table>";
    percentage = Math.round(found/total * 10000) / 100;
    var text = "<p><i>Search for \"" + document.form.input.value + "\" completed:<br />" + found  + " theses out of " + total + " (" + percentage + "%)</i></p>";
    output(text);
    output(table);
}

function getRow(number,node) {
// This function produces a row for the thesis in <node>

	return "<tr valign=\"top\"><td class =\"thesisnumber\" onclick=\"setInput(" + number + ");control('getThesis',document.form,true)\">" + number + "</td><td>" + node.innerHTML + "</td></tr>";

}

function checkInput(number) {
// This function checks whether <number> has the form of an LPA number.
// Used when theses are fetched, but not when text is searched.
// If so <number> is returned, else <null> is returned and the user is notified that the input is mistaken.

	var regExp = /^[1-7]$|^[1-7]\.\d\d*$/;
	// range is taken [0-8] with a view to sibling functions
	// (e.g., prevSibling of 1 should not lead to wrong input)
	if (number.match(regExp) != null) {
		return number;
	} else {
	   	clearOutput();
		throwException("checkInput");
		return null;
        }
}

function setInput(number) {
// This function put <numbr> in the inputfield
// The prevent the cursor from dangling somewhere at the page,
// the focus is set on the inputfield (commented out due to iPad)

   document.form.input.value = number;
   //document.form.input.focus();
}

function clearOutput() {
// This function clears the output-area

   document.getElementById("output").innerHTML = "";

}

function output(text) {
// This function adds text to the output-area

   document.getElementById("output").innerHTML += text;
}

function throwException (action) {
// This function collects all user exceptions at a single place.
// N.B. It does not incorporate technical exceptions (which are absent).
// Main virtue: maintainabilty and increased natural language independence of the script

      switch(action) {
	case "checkInput": output("<p><i>Wrong input or number.</i></p><p>&nbsp;</p>");
	break
	case "getThesis": output("<p><i>There is no thesis with the requested number.</i></p><p>&nbsp;</p>");
	break
	case "getParent": output("<p><i>This thesis has no parent.</i></p><p>&nbsp;</p>");
	break
	case "getInfants": output("<p><i>This thesis has no infants.</i></p><p>&nbsp;</p>");
	break
	case "getAdolescents": output("<p><i>This thesis has no adolescents.</i></p><p>&nbsp;</p>");
	break
	case "getChildren": output("<p><i>This thesis  has no children.</i></p><p>&nbsp;</p>");
	break
	case "getOffspring": output("<p><i>This thesis has no offspring.</i></p><p>&nbsp;</p>");
	break
	case "getPrevSibling":  output("<p><i>This thesis has no previous sibling.</i></p><p>&nbsp;</p>");
	break
	case "getNextSibling": output("<p><i>This thesis has no next sibling.</i></p><p>&nbsp;</p>");
	break
	case "getPrevThesis": output("<p><i>This thesis has no previous thesis.</i></p><p>&nbsp;</p>");
	break
        	case "getNextThesis":  output("<p><i>This thesis has no next thesis.</i></p><p>&nbsp;</p>");
	break
	case "hist": output("<p><i>There is no history.</i></p><p>&nbsp;</p>");
	break
	default:  "<p><i>What went wrong?</i></p>";
      }; 
}

function persp (view) {
// alert("+"+view+":"+document.getElementById(view).style.display+"+");
switch (document.getElementById(view).style.display) {
	case '' : document.getElementById(view).style.display = 'none' ;
	break
	case 'block' : document.getElementById(view).style.display = 'none' ;
	break
	case 'none': document.getElementById(view).style.display = 'block' ;
	break
	}
}

function addListener(a,b,c,d){if(a.addEventListener){a.addEventListener(b,c,d);return true;}else if(a.attachEvent){var e=a.attachEvent("on"+b,c);return e;}else{alert("Handler could not be attached");}}

function bind(a,b,c,d){return window.addListener(a,b,function(){d.apply(c,arguments)});}
function handleKeystroke(evt)
{             
// Grab the cross browser event
if( !evt ) evt = window.event;
// Character code of key pressed
var asc = !evt.keyCode ? (!evt.which ? evt.charCode : evt.which) : evt.keyCode;
// ASCII character of above code
var chr = String.fromCharCode(asc).toLowerCase();
for (var i in this)
{
  if (asc == i)
  {
 this[i](evt);
 break;
  }
}
}
function cancelEvent(evt)
{
evt.cancelBubble = true;
evt.returnValue = false;
if (evt.preventDefault) evt.preventDefault();
if (evt.stopPropagation) evt.stopPropagation();
return false;
}
//
// KEY COMMANDS
var keyMap = new Array();
var ENTER  = 13;
keyMap[ENTER] = enter;
//
function enter(evt)
{
document.form.input.blur();
clearOutput();
histAction.push('doSearch');
histInput.push(document.form.input.value);
doSearch();
}

// Add the keydown listner to the document object for global capture
bind(document, 'keydown', keyMap, handleKeystroke);