var Terminal = function (user, prompt,container) {
		
		// Private variables.
		var _hostAndPrompt = '';
		var _user = "user";
		var _containerId = '';
		var _promptSymbol = '';
		var _eraseLimit;
		
		// Semi-public variables? Should not be accessed directly.
		var filesInDirectory = [{name:"hello.txt",mimeType:"text/plain",content:"Hola, mundo!.",permissions:"rw-r--r--",type:1,owner:_user,size:1,date:"18 Oct 16:45"}];
		var consoleCommands = [
		{name:"man",description:"man - display the on-line manual pages (aka ''man pages'')",run:man},
		{name:"clear",description:"clear - clear the terminal screen",run:_clearConsole},
		{name:"shutdown",description:"shutdown - bring the system down",run:shutdown},
		{name:"reboot",description:"reboot - reboot the system",run:shutdown},
		{name:"ls",description:"ls - list directory contents",run:ls},
		{name:"cat",description:"cat - concatenate files and print on the standard output",run:cat}
		];
		
		
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
			var commandPos = $.inArray(command, $.map(consoleCommands,function(item,index){ return item.name;}));
			if( commandPos != -1)
			{
				console.log("Running " + command);
				consoleCommands[commandPos].run(arguments);
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
	
	return {
		initialize: doInitialize,
		clear: _clearConsole,
	};
};
