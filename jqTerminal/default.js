/*!
 * jqTerminal Default Commands Plugin. 
 * Copyright 2013, 2014 Federico Caminiti
 * Released under the BSD-2-Clause license
 * http://opensource.org/licenses/BSD-2-Clause
 */

defaultCommands =
[
  {name:"man",man:"man - display the on-line manual pages (aka ''man pages'')",run:man},
  {name:"clear",man:"clear - clear the terminal screen",run:clear},
  {name:"shutdown",man:"shutdown - bring the system down",run:shutdown},
  {name:"reboot",man:"reboot - reboot the system",run:shutdown},
  {name:"ls",man:"ls - list directory contents",run:ls},
  {name:"cat",man:"cat - concatenate files and print on the standard output",run:cat},
  {name:"echo",man:"echo - echo the contents of a file",run:echo},
  {name:"export", man:"export - set an environment variable", run:exportVariable}
];
		
function clear(arguments, self)
{
  self.clear();
}

// Show the manual pages for a given command.
function man(arguments, self)
{
  var consoleCommands = self.commands;
  var command = arguments[1];
  self.write("\n");
  
  if( command !== undefined && command.trim() != "")
  {
    // Does the command we're trying to search information about exist?	
    var commandIndex = $.inArray(command, $.map(consoleCommands,function(item,index){ return item.name;}));
    
    if(commandIndex != -1)
    {
      self.write(consoleCommands[commandIndex].man);
    }
    else
    {
      self.write("No manual entry for " + command);
    }
  }
  else
  {
    self.write("What manual page do you want?");
  }
}

// Bring the system down.
function shutdown(arguments, self)
{

  if((arguments !== undefined) && (arguments.length > 1) && (arguments[1].trim()!= "") && (arguments[1].indexOf("-t") != -1))
  {
    var time = arguments[2].trim(); 
    if(!isNaN(time))
    {
      // Wait <time> seconds before shuting down the system.
      self.write("\n");
      self.write("Bringing down the system in " + time + " seconds");
      self.write("\n");
      setTimeout(function(){shutdown([], self);}, (parseInt(time)*1000));
      return parseInt(time);
    }
    
  }
  
  self.destroy();
  
  return 0;
}

function ls(arguments, self)
{
  var separator = (arguments === undefined || arguments.indexOf("-l") == -1)? "\t" : "\n";
  var filesInDirectory = self.files;
 
  self.write("\n");
    
  for(dirIndex =0; dirIndex < filesInDirectory.length; dirIndex++)
  {			
    if( arguments.indexOf("-l") !== -1)
    {
      self.write(filesInDirectory[dirIndex].permissions + " " 
	             + filesInDirectory[dirIndex].type  + " " 
				 + filesInDirectory[dirIndex].owner + " " 
				 + filesInDirectory[dirIndex].owner + " " 
				 + filesInDirectory[dirIndex].date  + " ");
    }    
    
    self.write(filesInDirectory[dirIndex].name);
    self.write(separator);
	
  }
}

function cat(arguments, self)
{	
  var filesInDirectory = self.files;
  var filePos = $.inArray(arguments[1], $.map(filesInDirectory,function(item,index){ return item.name;}));
  
  if(filePos != -1)
  {
    self.write("\n");
    self.write(filesInDirectory[filePos].content);
  }
}

function echo(arguments, self)
{
  self.write("\n");
  var envValue;
  
  for(var i = 1; i < arguments.length; i++)
  {
    if(arguments[i].indexOf("$") == 0)
    {
      envValue = self.getEnvironmentVariable(arguments[i].slice(1, arguments[i].length));
      self.write(envValue);
      self.write("\n");
    }
    else
    {
      self.write(arguments[i]);
      self.write(" ");
    }
  }		
}

/* 
  Exports an environment variable.
  "arguments" is a string of the form  <environment variable> = <value> 
 */
function exportVariable(arguments, self)
{
  var splittedArguments = arguments[1].split("=");
  self.setEnvironmentVariable(splittedArguments[0], splittedArguments[1]);
}

/*
   Sets the background color for the console. 
   
   color: a string representing a valid html color be it a string (eg:"White") or a hexadecimal value ("#FFFFFF").
*/
function setBackgroundColor(color, self)
{
  var attrValue = "background-color:" + color;
  self.setAttribute("style", attrValue);
}