type updateBasketDTO = {
    id: string;
    positions: basketPositionDTO[]
}

type createBasketDTO = {
    userId: string,
    positions: basketPositionDTO[],
}

type returnBasketDTO = {
    id: string,
    userId: string,
    positions: returnBasketPositionDTO[],
}

type basketPositionDTO = {
    productId: string;
    productsAmount: number;
}

type returnBasketPositionDTO = {
    id: string;
    basketId: string;
    productId: string;
    productsAmount: number; 
}

export {updateBasketDTO, createBasketDTO, returnBasketDTO, basketPositionDTO, returnBasketPositionDTO}