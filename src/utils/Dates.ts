import { DatesObject } from "../types/global/Dates";

export const createDatesObject = (startDate: string, endDate: string): DatesObject=>{
  const start = new Date(startDate);
  const end = new Date(endDate);

  startDate = `${start.getFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}-01`;
  endDate = `${end.getFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`;

  const pastMonthStart = new Date(start.getUTCFullYear(), start.getUTCMonth() -1, 1);
  const pastMonthEnd = new Date(start.getUTCFullYear(), start.getUTCMonth(), 0);    
  
  const pastMonthStartDate = `${pastMonthStart.getUTCFullYear()}-${String(pastMonthStart.getUTCMonth() + 1).padStart(2, '0')}-01`;
  const pastMonthEndDate = `${pastMonthEnd.getUTCFullYear()}-${String(pastMonthEnd.getUTCMonth() + 1).padStart(2, '0')}-${String(pastMonthEnd.getUTCDate()).padStart(2, '0')}`;

  return {
    startDate,
    endDate,
    pastMonthStartDate,
    pastMonthEndDate
  }
}

export const getIntervalFromDate = (intervalTime: number)=>{
  if (intervalTime / 365 > 1) return `${Math.round(intervalTime / 365)} ${intervalTime > 730 ? 'anos' : 'ano'} atrás`;
  if (intervalTime / 30 > 1) return `${Math.round(intervalTime / 30)} ${intervalTime > 58 ? 'meses' : 'mês'} atrás`;
  if (intervalTime > 1) return `${intervalTime} dias atrás`
  return `${intervalTime} dia atrás`
}