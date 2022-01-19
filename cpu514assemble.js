/*
* Imports
*/
const fs = require("fs");
const path = require('path');

/*
Convert Function
*/
function convert(inputOpcode,inputAddressingMode,inputOperand)
{
    let addressingMode = parseInt(inputAddressingMode,16);
    let baddressingMode = addressingMode.toString(2)
    baddressingMode = baddressingMode.padStart(2,"0")

    let operand = parseInt(inputOperand,16);
    let boperand = operand.toString(2)
    boperand = boperand.padStart(16,"0")

    let opcode = inputOpcode;
    let bopcode = opcode.toString(2)
    bopcode = bopcode.padStart(6,"0")

    let bin = '0b' + bopcode + baddressingMode + boperand;
    let instr = parseInt(bin.substring(2,),2).toString(16).padStart(6,"0");
    return instr
};

/*
* Main Function (CPU514ASSEMBLE)
*/
async function cpu514assemble()
{
    // initial variables
    let fileNameToRead = process.argv.slice(2)[0]
    let fileNameToWrite = fileNameToRead.split(".asm")[0] + ".bin"
    let prog_bin = ""
    let memoryAddress = 0
    let labels = []
    let labelsJson = {}
    let registerJson = {"A": 1,"B": 2,"C": 3,"D": 4,"E": 5,"S": 6,"PC": 0}
    let instructionJson = {
        "HALT": 0x01,"LOAD": 0x02,
        "STORE": 0x03,"ADD": 0x04,
        "SUB": 0x05,"INC": 0x06,
        "DEC": 0x07,"XOR": 0x08,
        "AND": 0x09,"OR": 0x0A,
        "NOT": 0x0B,"SHL": 0x0C,
        "SHR": 0x0D,"NOP": 0x0E,
        "PUSH": 0x0F,"POP": 0x10,
        "CMP": 0x11,"JMP": 0x12,
        "JZ": 0x13,"JE": 0x13,
        "JNZ": 0x14,"JNE": 0x14,
        "JC": 0x15,"JNC": 0x16,
        "JA": 0x17,"JAE": 0x18,
        "JB": 0x19,"JBE": 0x1A,
        "READ": 0x1B,"PRINT": 0x1C
    }

    // read .asm file and apply operations
    fs.readFile(path.join(__dirname,fileNameToRead),'utf-8',(err,data) =>
    {
        if(err) throw err;
        let text = data.split("\n")
        for(line of text)
        {
            try
            {
                line = line.split("\r")[0]
            }
            catch {
                line = line
            }
            words = line.split(" ")
            for(word of words)
            {
                if(word.length === 0)
                {
                    words.splice(words.indexOf(word),1)
                }
            }
            line = line.trim()
            if(words[words.length - 1][words[words.length - 1].length - 1] != ":")
            {
                memoryAddress += 3
            } else
            {
                labelsJson[words[0].split(":")[0].toUpperCase()] = Number(memoryAddress).toString(16)
                labels.push(words[0].split(":")[0].toUpperCase())
            }
        }

        for(line of text)
        {
            try
            {
                line = line.split("\r")[0]
            }
            catch {
                line = line
            }
            words = line.split(" ")
            for(word of words)
            {
                if(word.length === 0)
                {
                    words.splice(words.indexOf(word),1)
                }
            }
            line = line.trim()
            let opcode
            let addressingMode
            let operand

            if(words[words.length - 1][words[words.length - 1].length - 1] != ":")
            {
                // instructions
                if(words[0].toUpperCase() in instructionJson)
                {
                    opcode = instructionJson[words[0].toUpperCase()]
                }
                if(words.length == 2)
                {
                    // character
                    if(words[1][0] === "'" && words[1][words[1].length - 1] === "'")
                    {
                        // operand	is	immediate	data
                        addressingMode = 0
                        operand = "0x" + parseInt(words[1].split("'")[1].charCodeAt(),10).toString(16)
                    }

                    // memory address
                    else if(words[1][0] == "[" && words[1][words[1].length - 1] == "]")
                    {
                        if(registerJson[words[1].substring(1,words[1].length - 1).toUpperCase()])
                        {
                            // operand’s	memory	address	is	given in the	register
                            addressingMode = 2
                            operand = registerJson[words[1].substring(1,words[1].length - 1).toUpperCase()]
                        }
                        else
                        {
                            // operand	is	a	memory	address
                            addressingMode = 3
                            operand = words[1].substring(1,words[1].length - 1)
                        }
                    }

                    // register
                    else if(words[1].toUpperCase() in registerJson)
                    {
                        //operand	is	in	given	in	the register
                        addressingMode = 1
                        operand = registerJson[words[1].toUpperCase()]
                    }

                    // label
                    else if(labels.includes(words[1].toUpperCase()))
                    {
                        // operand	is	immediate	data
                        addressingMode = 0
                        operand = labelsJson[words[1].toUpperCase()]
                    }

                    // hex number
                    else if(isNaN(words[1][0]) == false)
                    {
                        // operand	is	immediate	data
                        addressingMode = 0
                        operand = words[1]
                    }
                    else if(Number(words[1]).toString(16))
                    {
                        // operand	is	immediate	data
                        addressingMode = 0
                        operand = words[1]
                    }
                }

                // HALT or NOP
                else if(words.length == 1)
                {
                    addressingMode = 0
                    operand = 0
                }
                let writingData = convert(opcode,addressingMode,operand)
                prog_bin = prog_bin + writingData + "\n"
            }
        }

        // write data to .bin file
        fs.writeFileSync(fileNameToWrite,prog_bin.slice(0,prog_bin.lastIndexOf("\n")).toUpperCase(),function(err)
        {
            if(err) throw err;
        });
    }
    )
}
cpu514assemble()