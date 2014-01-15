var Terminal = function (user, prompt,container) {
		
		// Private variables.
		var _hostAndPrompt = '';
		var _user = "user";
		var _containerId = '';
		var _promptSymbol = '';
		var _eraseLimit;
		var _self;
		
		// Semi-public variables? Should not be accessed directly.
		var _filesInDirectory = [{name:"hello.txt",mimeType:"text/plain",content:"Hola, mundo!.",permissions:"rw-r--r--",type:1,owner:_user,size:1,date:"18 Oct 16:45"}];
		
		/*var consoleCommands = [
		{name:"man",description:"man - display the on-line manual pages (aka ''man pages'')",run:man},
		{name:"clear",description:"clear - clear the terminal screen",run:_clearConsole},
		{name:"shutdown",description:"shutdown - bring the system down",run:shutdown},
		{name:"reboot",description:"reboot - reboot the system",run:shutdown},
		{name:"ls",description:"ls - list directory contents",run:ls},
		{name:"cat",description:"cat - concatenate files and print on the standard output",run:cat},
		{name:"echo",description:"echo - echo the contents of a file",run:echo}
		];*/
		
		var _consoleCommands = [];
		
		function getCommandInput()
		{
			var lastLine = $(".console").val().split('\n')[$(".console").val().split('\n').length-1];
			command = lastLine.split(_promptSymbol)[1];
			return command;
		}

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

		function _write(text)
		{
		  $(".console").val($(".console").val() + text);
		}

		function executeCommand(command,arguments)
		{
			var commandPos = $.inArray(command, $.map(_consoleCommands,function(item,index){ return item.name;}));
			if( commandPos != -1)
			{
				console.log("Running " + command);
				_consoleCommands[commandPos].run(arguments,_self);
			}
			else
			{
				 $(".console").val($(".console").val() + "\n");
				_write("bash: " + command + ": command not found");
			}
		}
		
		function handleClick(event)
		{
			if($(".console")[0].selectionStart  <= _eraseLimit || $(".console")[0].selectionEnd <= _eraseLimit)
			{
				$(".console")[0].selectionStart = _eraseLimit;
				$(".console")[0].selectionEnd = _eraseLimit;
			}
		}

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
					// 8 - backspace,.
					preventPromptErasing(false);
					break;
				case 38:				
				case 40:
					 //38 up arrow, 40 - down arrow
					event.preventDefault();
					break;
				default:
					//preventPromptErasing();
					break;
			}
		}
		
		function handleInitKey()		
		{
		  event.preventDefault();
		  $(".console")[0].selectionStart = _eraseLimit;
		  $(".console")[0].selectionEnd = _eraseLimit;		  
		}
		
		//Enter key has been pressed.	   
		function handleEnterKey(event)
		{
		   event.preventDefault(); // Do not insert a newline. Instead, let us handle the event.		  
		   var commandQuery = getCommandInput().trim();
		   if(commandQuery != "")
		   {
			  var splitCommand = commandQuery.split(" ");
			  executeCommand(splitCommand[0],splitCommand);
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
	
	
	/* A command should have, at least the following sections:
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
	
	function doDestroy()
	{
		$("#" + _containerId).remove();
	}

	
	/*
			// --- Predefined commands. --- \\

		// Show the manual pages for a given command.
		function man(arguments)
		{
			var command = arguments[1];
			_write("\n");
			if( command !== undefined && command.trim() != "")
			{
				// Does the command we're trying to search information about exist?	
				var commandIndex = $.inArray(command, $.map(consoleCommands,function(item,index){ return item.name;}));
				if(commandIndex != -1)
				{
					_write(consoleCommands[commandIndex].description);
				}
				else
				{
					_write("No manual entry for " + command);
				}
			}
			else
			{
				_write("What manual page do you want?");
			}
		}

	// Bring the system down....that means close the window!
	// Arguments, an array of space-separated values representing arguments.
	function shutdown(arguments)
	{
		// Implementing a wait operation.
		if((arguments !== undefined) && (arguments.length > 1) && (arguments[1].trim()!= "") && (arguments[1].indexOf("-t") != -1))
		{
			var time = arguments[2].trim(); 
			if(!isNaN(time))
			{
				//wait "time" seconds before shuting down the system.
				_write("\n");
				_write("Bringing down the system in " + time + " seconds");
				_write("\n");
				setTimeout(shutdown, (parseInt(time)*1000));
				return parseInt(time);
			}
		}
		
		$("#" + _containerId).remove();
		
		return 0;
	}
	
	function ls(arguments)
	{
	   var separator = (arguments === undefined || arguments.indexOf("-l") == -1)? "\t" : "\n";
	   
	   _write("\n");
	   
	   for(dirIndex =0; dirIndex < filesInDirectory.length; dirIndex++)
	   {
			if( arguments.indexOf("-l") !== -1)
			{
				_write(filesInDirectory[dirIndex].permissions + " " + filesInDirectory[dirIndex].type + " " + filesInDirectory[dirIndex].owner + " " + filesInDirectory[dirIndex].owner + " " + filesInDirectory[dirIndex].date + " ");
			}
			_write(filesInDirectory[dirIndex].name);
			_write(separator);
	   }
	}
	
	function cat(arguments)
	{
		var filePos = $.inArray(arguments[1], $.map(filesInDirectory,function(item,index){ return item.name;}));
	    if(filePos != -1)
		{
		  _write("\n");
		  _write(filesInDirectory[filePos].content);
		}
	}
	
	function echo(arguments)
	{
	  
	   _write("\n");
	  
	  for(var i = 1; i < arguments.length; i++)
	  {
		  _write(arguments[i]);
		  _write(" ");
	  }		
	}*/
	
	
	
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
