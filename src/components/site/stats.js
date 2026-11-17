// Figures shown in the homepage hero; tests/content-migration checks them against the content index.
import {classicPages} from '../../content/catalogue.js';
const two=n=>String(n).padStart(2,'0');
export const siteStats=[['05','公版獎盃','#/explore/standard'],[two(classicPages('cases').length),'合作案例','#/explore/cases'],['09','循環材料','#/explore/materials']];
