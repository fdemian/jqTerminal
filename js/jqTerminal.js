/*!
 * jqTerminal
 * Copyright 2013, 2014 Federico Caminiti
 * Released under the BSD-2-Clause license
 * http://opensource.org/licenses/BSD-2-Clause
 */
 
var Terminal = function (user, prompt,container) {
		
		// Private variables.
		var _hostAndPrompt = '';
		var _user = "user";
		var _containerId = '';
		var _promptSymbol = '';
		var _eraseLimit;
		var _self;
		var _filesInDirectory = [{name:"hello.txt",mimeType:"text/plain",content:"Hola, mundo!.",permissions:"rw-r--r--",type:1,owner:_user,size:1,date:"18 Oct 16:45"}];		
		var _consoleCommands = [];
		
		// Gets the commands that was typed into the console.
		function getCommandInput()
		{
			var lastLine = $(".console").val().split('\n')[$(".console").val().split('\n').length-1];
			command = lastLine.split(_promptSymbol)[1];
			return command;
		}
		
		// Inserts a new line in the console. 
		function _insertNewLine()
		{
			 $(".console").val($(".console").val() + '\n' + _hostAndPrompt);
			  // Set the limit for erasing the conosole to the beginning of the newline.
			 _eraseLimit = $(".console").val().length;
		}

		// Clear the console.
		function _clearConsole()
		{
			$(".console").val("" + _hostAndPrompt);
			_eraseLimit = _hostAndPrompt.length;
		}
		
		// Writes the given text on the console.
		function _write(text)
		{
		  $(".console").val($(".console").val() + text);
		}
		
		// Executes a given command. 
		function executeCommand(command,arguments)
		{
			var commandPos = $.inArray(command, $.map(_consoleCommands,function(item,index){ return item.name;}));
			if( commandPos != -1)
			{
				_consoleCommands[commandPos].run(arguments,_self);
			}
			else
			{
				 $(".console").val($(".console").val() + "\n");
				_write("bash: " + command + ": command not found");
			}
		}
		
		// Handles the click event. 
		function handleClick(event)
		{
			if($(".console")[0].selectionStart  <= _eraseLimit || $(".console")[0].selectionEnd <= _eraseLimit)
			{
				$(".console")[0].selectionStart = _eraseLimit;
				$(".console")[0].selectionEnd = _eraseLimit;
			}
		}
		
		/*
		Handles the keypress events to prevent the user to erase the command prompt.
		Relevant keys/events: 
		
		8  - Backspace.
		13 - Enter.
		36 - Init key.
		37 - Arrow back.
		38 - Arrow up.
		39 - Arrow forward (this case is not being handled).
		40 - Arrow down.
		46 - Supress key. 
		
		*/
		function handleKeydown(event)
		{		

			console.log(event.which);
				
			switch(event.which)
			{							
				case 13:
					 handleEnterKey(event);
					break;
				case 36:
					handleInitKey();
				case 46:
					preventPromptErasing(true);
				case 8:	
				case 37:								
					preventPromptErasing(false);
					break;
				case 38:				
				case 40:
					event.preventDefault();
					break;
				default:
					// As of now, nothing is done in this case.
					break;
			}
		}
		
		// Handles the init key.								
		function handleInitKey()		
		{
		  event.preventDefault();
		  $(".console")[0].selectionStart = _eraseLimit;
		  $(".console")[0].selectionEnd = _eraseLimit;		  
		}
		
		// Handles the enter key.    
		function handleEnterKey(event)
		{
		   event.preventDefault(); // Do not insert a newline. Instead, let us handle the event.		  
		   var commandQuery = getCommandInput().trim();
		   var splitCommand;
		   if(commandQuery != "")
		   {
			  splitCommand = commandQuery.split(" ");
			  executeCommand(splitCommand[0],splitCommand);
		   } else {
			  splitCommand = [commandQuery];
		   }
		  
		  if(splitCommand[0].indexOf("clear") == -1)
		  {
			 _insertNewLine();
		  }
		  
		  return false;
		}

		// Prevents the user from deleting the command prompt.
		function preventPromptErasing(deleteKeyPressed)
		{				  
		      
		  
			if($(".console")[0].selectionStart  < _eraseLimit || $(".console")[0].selectionEnd < _eraseLimit || (!deleteKeyPressed && $(".console")[0].selectionStart  == _eraseLimit || $(".console")[0].selectionEnd == _eraseLimit))
			{
				event.preventDefault();
				$(".console")[0].selectionStart = _eraseLimit;
				$(".console")[0].selectionEnd = _eraseLimit;
			}
		}
	
	// Initialize the console and all of its relevant variables.
	function doInitialize()
	{
		// Initialize variables
		_promptSymbol = prompt;
		_hostAndPrompt = user + prompt;		
		_containerId = container;
		_self = this;
		var con = $("<textarea class=\"console\" spellcheck=\"false\">");
		con.val(_hostAndPrompt);
		_eraseLimit = _hostAndPrompt.length;
		con.keydown(function( event ) { handleKeydown(event);});
		
		// Initialize the conosle and place it inside its container.
		var term = $("<textarea class=\"console\" spellcheck=\"false\">");
		term.val(_hostAndPrompt);
		term.keydown(function( event ) { handleKeydown(event);});
		$("#" + _containerId).append(term);
		$("#" + _containerId).click(function (event) {handleClick(event);});
	}
	
	
	/* 
		Adds a command: 
		
		A command should have, at least the following sections:
		- name (the name of the command). 
		- man  (a description of what it does).
		- run  (the code that executes when the console runs the command).
	*/
	function addCommand(command)
	{
		if(command.name !== undefined && command.man !== undefined && command.run !== undefined)
		{
			_consoleCommands.push(command);
		}
	}
	
	// Removes the console from its container.
	function doDestroy()
	{
		$("#" + _containerId).remove();
	}

	return {
		initialize: doInitialize,
		clear: _clearConsole,
		write: _write,
		files: _filesInDirectory,
		commands: _consoleCommands,
		addCommand:addCommand,
		destroy: doDestroy
	};
};
