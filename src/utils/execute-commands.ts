export function executeRType(
    instruction: string,
    writeRegister: string,
    readRegister1: string,
    readRegister2: string,
    registerMemory: Record<string, number>
): void {
    const val1: number = registerMemory[readRegister1] ?? 0;
    const val2: number = registerMemory[readRegister2] ?? 0;
    let result = 0;

    switch (instruction) {
        case 'add':
            result = val1 + val2;
            break;
        case 'sub':
            result = val1 - val2;
            break;
        case 'and':
            result = val1 & val2;
            break;
        case 'or':
            result = val1 | val2;
            break;
        case 'xor':
            result = val1 ^ val2;
            break;
        case 'sll':
            result = val1 << (val2 & 0x1F);
            break;
        case 'srl':
            result = val1 >>> (val2 & 0x1F);
            break;
        case 'sra':
            result = val1 >> (val2 & 0x1F);
            break;
        case 'slt':
            result = val1 < val2 ? 1 : 0;
            break;
        case 'sltu':
            result = (val1 >>> 0) < (val2 >>> 0) ? 1 : 0;
            break;
        // Add more R-type instructions as needed
        default:
            // For unsupported instructions, do not update
            return;
    }
    registerMemory[writeRegister] = result; // Write the result to the destination register
}


export function executeBType(
    instruction: string,
    val1: number,
    val2: number,
): boolean {
    switch (instruction) {
        case 'beq':
            if (val1 === val2) {
                return true;
            }
            break;
        case 'bne':
            if (val1 !== val2) {
                return true;
            }
            break;
        case 'blt':
            if (val1 < val2) {
                return true;
            }
            break;
        case 'bge':
            if (val1 >= val2) {
                return true;
            }
            break;
        case 'bltu':
            if ((val1 >>> 0) < (val2 >>> 0)) {
                return true;
            }
            break;
        case 'bgeu':
            if ((val1 >>> 0) >= (val2 >>> 0)) {
                return true;
            }
            break;
        // Add more B-type instructions as needed
        default:
            // For unsupported instructions, do not update
            return false; // Default to next instruction
    }

    return false; // If no branch taken, return next instruction
}



export function handleITypeArithmetic(
    instruction: string,
    writeRegister: string,
    readRegister: string,
    immediate: string | number,
    namedRegisterMemory: Record<string, number>
) {
    const srcVal = namedRegisterMemory[readRegister] ?? 0;
    const immVal = Number(immediate);
    let result: number;

    switch (instruction) {
        case 'addi':
            result = srcVal + immVal;
            break;
        case 'andi':
            result = srcVal & immVal;
            break;
        case 'ori':
            result = srcVal | immVal;
            break;
        case 'xori':
            result = srcVal ^ immVal;
            break;
        case 'slti':
            result = srcVal < immVal ? 1 : 0;
            break;
        case 'sltiu':
            result = (srcVal >>> 0) < (immVal >>> 0) ? 1 : 0;
            break;
        case 'slli':
            result = srcVal << immVal;
            break;
        case 'srli':
            result = srcVal >>> immVal;
            break;
        case 'srai':
            result = srcVal >> immVal;
            break;
        default:
            throw new Error(`Unsupported I-type arithmetic instruction: ${instruction}`);
    }

    // Write result to destination register
    namedRegisterMemory[writeRegister] = result;

}
