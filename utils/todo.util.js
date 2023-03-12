import { ValidateError } from '../constants/error'
import * as R from 'ramda'

export type TodoSummaryItemConfig = {
    name: string,
    displayCode: string,
    attribute: string,
    seq: number,
    editable: boolean,
}

export type TodoMobileConfig = {
    summaryItems: summaryItems[],
}

export function getTodoMobileConfig(trip: Trip): TodoMobileConfig {
    const summaryItems: TodoSummaryItemConfig[] = R.pathOr([], ['metadata','mobileConfig', 'todo', 'summary', 'summaryItems'], trip)
    return {
        summaryItems,
    }
}

export function validateSummaryAttribute(summaryItems: TodoSummaryItemConfig[], input: object){
    summaryItems.forEach((item: TodoSummaryItemConfig) => {
        if(!(item.attribute in input)) {
            throw new ValidateError(`${item.attribute} is required.`);
        }
    });
    return true;
}

export function pickAttributeOrGetFromTrip(summaryItems: TodoSummaryItemConfig[], input: object, trip: Trip) {
    let resultObject: object = {};
    summaryItems.forEach((item: TodoSummaryItemConfig) => {
        resultObject[item.attribute] = 
            (item.editable)? 
            R.path([item.attribute], input) : 
            R.path(['detailService', item.attribute], trip.payment);
    });
    return resultObject;
}
