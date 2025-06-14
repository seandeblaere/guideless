export const getMarkerIcon = (visited: boolean, types: string[]) => {
    const natureTypes = [
        'botanical_garden',
        'garden',
        'national_park',
        'park',
        'hiking_area',
        'state_park'
    ];
    
    const historyTypes = [
        'historical_landmark',
        'historical_place',
        'monument'
    ];
    
    const foodTypes = [
        'restaurant',
        'cafe',
        'bakery',
        'meal_takeaway',
        'bar'
    ];
    
    const cultureTypes = [
        'cultural_landmark',
        'art_gallery',
        'sculpture',
        'monument',
        'amphitheatre',
        'plaza',
        'cultural_center',
        'museum',
        'concert_hall',
        'opera_house',
        'observation_deck'
    ];
    
    if(visited) {
        return require('../assets/icons/visited.png');
    }

    if (types.some(type => natureTypes.includes(type))) {
        return require('../assets/icons/nature.png');
    }
    
    if (types.some(type => historyTypes.includes(type))) {
        return require('../assets/icons/history.png');
    }
    
    if (types.some(type => foodTypes.includes(type))) {
        return require('../assets/icons/food.png');
    }
    
    if (types.some(type => cultureTypes.includes(type))) {
        return require('../assets/icons/culture.png');
    }
    
    return require('../assets/icons/culture.png');
}