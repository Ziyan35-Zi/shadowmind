import {applicationQuestions} from './application-questions';
import {academyLessons} from './lessons';
import {conversations} from './conversations';
import type {Question} from './types';
export const academyQuestions:Question[]=[...academyLessons.map(l=>({...l.check,id:`check-${l.id}`,lessonId:l.id,category:l.module})),...conversations.map((c,i)=>({id:`interpret-${c.id}`,lessonId:c.lessonId,category:academyLessons.find(l=>l.id===c.lessonId)!.module,difficulty:(i%3===0?'Beginner':i%3===1?'Intermediate':'Advanced') as Question['difficulty'],prompt:`${c.context}\n${c.dialogue.join('\n')}\n${c.question}`,options:c.options,correct:c.correct,explanation:`${c.explanation} What remains uncertain: ${c.uncertain}`})),...applicationQuestions];
