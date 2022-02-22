function fn<T extends any>(val: T): T{
    return val
}



fn('str')