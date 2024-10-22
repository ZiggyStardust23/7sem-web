type phoneFullDTO = {
    id: string;
    name: string;
    producername: string;
    osname: string;
    ramsize: number;
    memsize: number;
    camres: number;
    price: number;
}

type phoneSearchDTO = {
    minramsize: number | undefined;
    maxramsize: number | undefined;
    minmemsize: number | undefined;
    maxmemsize: number | undefined;
    mincamres: number | undefined;
    maxcamres: number | undefined;
    name: string | undefined,
    producername: string | undefined,
    osname: string | undefined,
    minPrice: number | undefined,
    maxPrice: number | undefined,
};


type phoneCreateDTO = {
    name: string;
    producername: string;
    osname: string;
    ramsize: number;
    memsize: number;
    camres: number;
    price: number;
}

type returnPhoneDTO = {
    id: string;
    name: string;
    producername: string;
    osname: string;
    ramsize: number;
    memsize: number;
    camres: number;
    price: number;
};



export { phoneFullDTO, phoneCreateDTO, phoneSearchDTO, returnPhoneDTO }