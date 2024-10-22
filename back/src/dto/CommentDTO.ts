type commentCreateDTO = {
    userid: string, 
    productId: string, 
    text: string,
}

type commentUpdateRateDTO = {
    id: string, 
    rate: number
}

type returnCommentDTO = {
    id: string, 
    userId: string, 
    productId: string,
    text: string,
    rate: number
}

export {commentCreateDTO, commentUpdateRateDTO, returnCommentDTO}