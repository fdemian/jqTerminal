/*!
 * jqTerminal
 * Copyright 2013, 2014 Federico Caminiti
 * Released under the BSD-2-Clause license
 * http://opensource.org/licenses/BSD-2-Clause
 */
var Terminal = function (user, prompt, container) {
	
	"use strict"; 
	
    // Private variables.
    var _hostAndPrompt = '';
    var _user = "user";
    var _containerId = '';
    var _promptSymbol = '';
    var _eraseLimit;
    var _self;
    var _filesInDirectory = [{name:"hello.txt",mimeType:"text/plain",content:"¡Hola mundo!\nHello world!\nHallo welt!",permissions:"rw-r--r--",type:1,owner:_user,size:1,date:"18 Oct 16:45"}];
    var _consoleCommands = [];
    var _environmentVariables = [];
    var _commandQueue = [];
    var _currentCommandIndex = 0;
    
    // Gets the command that was typed into the console.
    function getCommandInput()
    {
        var lastLine = $(".console").val().split('\n')[$(".console").val().split('\n').length-1];
        var lastLineSplit = lastLine.split(_promptSymbol);
        var command = "";
        var i; 
		
        for(i =1; i < lastLineSplit.length; i ++)
        {
            command = command + " " + (i >= 2? _promptSymbol : "") + lastLineSplit[i]; 
        }
                
        return command;
    }
    
    // Replaces the current command of the console with the specified string. 
    function setCommandInput(command)
    {
       var newValue = $(".console").val().slice(0, _eraseLimit) + command;
       $(".console").val(newValue);
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
    function executeCommand(command,commandArguments)
    {
        var commandPos = $.inArray(command, $.map(_consoleCommands,function(item,index){ return item.name;}));
        if( commandPos != -1)
        {
            _consoleCommands[commandPos].run(commandArguments,_self);
        }
        else
        {
             $(".console").val($(".console").val() + "\n");
            _write("bash: " + command + ": command not found");
        }
    }
	
	// Replaces the current command on the console with the previous or the next one in the queue.
    function applyCommandHistory(arrowUp)
    {            
	
        /* If there are no commands in the queue or we got to the last one and the arrow down button is pressed, 
		   we don't do anything.
		*/
        if( (_commandQueue.length == 0) || (_currentCommandIndex == _commandQueue.length && !arrowUp))
        {
            return;
        }
                                        
        if(arrowUp)
        {
            _currentCommandIndex = _currentCommandIndex == 0 ? 0 : (_currentCommandIndex-1);
        }
        else
        {
            _currentCommandIndex = _currentCommandIndex == (_commandQueue.length-1) ? (_commandQueue.length-1) : (_currentCommandIndex+1);
        }    
		
        setCommandInput(_commandQueue[_currentCommandIndex]);
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
	
	// Prevents the user from deleting the command prompt.
    function preventPromptErasing(event, deleteKeyPressed)
    {                  
        if($(".console")[0].selectionStart  < _eraseLimit || $(".console")[0].selectionEnd < _eraseLimit || (!deleteKeyPressed && $(".console")[0].selectionStart  == _eraseLimit || $(".console")[0].selectionEnd == _eraseLimit))
        {
            event.preventDefault();
            $(".console")[0].selectionStart = _eraseLimit;
            $(".console")[0].selectionEnd = _eraseLimit;
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
       
       _commandQueue.push(commandQuery);
       _currentCommandIndex++;
       
       if(commandQuery != "")
       {
          splitCommand = commandQuery.split(" ");
          executeCommand(splitCommand[0],splitCommand);
       } 
       else 
       {
          splitCommand = [commandQuery];
       }
      
      if(splitCommand[0].indexOf("clear") == -1)
      {
         _insertNewLine();
      }
      
      return false;
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
				break;
            case 46:
                preventPromptErasing(event, true);
				break;
            case 8:    
            case 37:                                
                preventPromptErasing(event, false);
                break;
            case 38:    
                event.preventDefault();
                applyCommandHistory(true);
                break;
            case 40:
                applyCommandHistory(false);
                event.preventDefault();
                break;
            default:
                // As of now, nothing is done in this case.
                break;
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
    
    // Adds a list of commands to the terminal.
    function addCommandList(commandList)
    {
		var i;
		
        for(i =0; i < commandList.length; i++)
        {
          addCommand(commandList[i]);
        }
    }
    
    function getEnvironmentVariable(variableName)
    {
        var varPos = $.inArray(variableName, $.map(_environmentVariables,function(item,index){ return item.name;}));
        
        /* 
        If there is no environment variable with the specified name present,
        we treat the input as if it were normal text, despite of the $ sign.
        */
        if(varPos == -1)
        {
            return "$" + variableName;
        }
        
        return _environmentVariables[varPos].value;
    }
    
    // Sets an environment variable. 
    function setEnvironmentVariable(envName, envValue)
    {
        _environmentVariables.push({name:envName,value:envValue});
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
        insertNewLine:_insertNewLine,
        commands: _consoleCommands,
        addCommand:addCommand,
        addCommandList:addCommandList,
        destroy: doDestroy,
        getEnvironmentVariable: getEnvironmentVariable,
        setEnvironmentVariable: setEnvironmentVariable
    };
};
