import {academyLessons} from './lessons';
import {conversations} from './conversations';
import {branchingCases} from './cases';
import {experiments} from './experiments';
import {academyQuestions} from './questions';
import {glossary,revisionCards} from './glossary';
import {references,modules} from './references';
import {toolkit} from './toolkit';
export function validateContent(){
 const errors:string[]=[]; const links:string[]=[];
 const lessonIds=new Set(academyLessons.map(l=>l.id));const refIds=new Set(references.map(r=>r.id));
 const check=(test:boolean,message:string)=>{if(!test)errors.push(message)};
 const unique=(name:string,items:{id:string}[])=>check(new Set(items.map(i=>i.id)).size===items.length,`${name}: duplicate IDs`);
 const related=(id:string,targets:string[])=>targets.forEach(t=>{if(!lessonIds.has(t)){errors.push(`${id}: broken lesson link ${t}`);links.push(`${id} → ${t}`)}});
 [academyLessons,conversations,branchingCases,experiments,academyQuestions,glossary,revisionCards,toolkit,references].forEach((a,i)=>unique(`collection ${i}`,a));
 unique('lesson titles',academyLessons.map(l=>({id:l.title})));
 check(new Set(academyLessons.map(l=>l.number)).size===academyLessons.length,'Duplicate lesson numbers');
 for(let n=1;n<=55;n++)check(academyLessons.some(l=>l.number===n),`Missing curriculum position ${n}`);
 for(const m of modules)check(academyLessons.filter(l=>l.module===m.id).length===m.target,`Module ${m.id}: incomplete coverage`);
 let incomplete=0;
 for(const l of academyLessons){const fields=['definition','explanation','mechanism','notice','not','consequences','tips','alternative','evidence'] as const;const missing=fields.filter(k=>!l[k]?.trim());if(missing.length||l.examples.some(x=>!x.trim())||l.dialogue.some(x=>!x.trim())||l.takeaways.some(x=>!x.trim())||!l.check.prompt.trim()||!l.check.explanation.trim())incomplete++;missing.forEach(k=>errors.push(`${l.id}: missing ${k}`));check(l.examples.length>=2,`${l.id}: missing examples`);check(l.takeaways.length>=3,`${l.id}: missing takeaways`);check(l.dialogue.length>=2,`${l.id}: missing dialogue`);related(l.id,l.related);l.references.forEach(r=>check(refIds.has(r),`${l.id}: missing reference ${r}`));check(l.references.length>0,`${l.id}: no sources`);}
 for(const q of academyQuestions){related(q.id,[q.lessonId]);check(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length,`${q.id}: answer index`);check(!!q.explanation.trim(),`${q.id}: missing explanation`);check(new Set(q.options).size===q.options.length,`${q.id}: duplicate options`);}
 check(new Set(academyQuestions.map(q=>q.prompt)).size===academyQuestions.length,'Duplicate question prompts');
 for(const c of conversations){related(c.id,[c.lessonId]);check(c.correct>=0&&c.correct<c.options.length,`${c.id}: answer index`);['context','question','explanation','warning','uncertain','response'].forEach(k=>check(Boolean(c[k as keyof typeof c]),`${c.id}: missing ${k}`));}
 for(const c of branchingCases){related(c.id,[c.lessonId]);const nodes=new Map(c.nodes.map(n=>[n.id,n]));check(nodes.has('start'),`${c.id}: missing start`);unique(c.id,c.nodes);for(const n of c.nodes){check(n.choices.length>=2,`${c.id}/${n.id}: insufficient choices`);for(const x of n.choices){check(!!x.feedback,`${c.id}/${n.id}: no feedback`);check(x.next===null||nodes.has(x.next),`${c.id}: broken branch ${x.next}`);}}const walk=(id:string,depth:number,seen:Set<string>)=>{if(seen.has(id)){errors.push(`${c.id}: branch cycle`);return;}const n=nodes.get(id);if(!n)return;for(const choice of n.choices){if(choice.next===null)check(depth>=3,`${c.id}: fewer than three decisions`);else walk(choice.next,depth+1,new Set([...seen,id]));}};walk('start',1,new Set());const reached=new Set<string>();const visit=(id:string)=>{if(reached.has(id))return;reached.add(id);nodes.get(id)?.choices.forEach(x=>{if(x.next)visit(x.next)});};visit('start');check(reached.size===nodes.size,`${c.id}: unreachable case nodes`);}
 for(const g of glossary){related(g.id,g.related);check(!!g.definition&&!!g.example,`${g.id}: incomplete glossary`);}
 for(const e of experiments){if(e.lessonId)related(e.id,[e.lessonId]);check(e.options.length===e.outcomes.length,`${e.id}: missing outcomes`);check(!!e.limitations&&!!e.application,`${e.id}: missing context`);}
 const counts={lessons:academyLessons.length,completeLessons:academyLessons.length-incomplete,incompleteLessons:incomplete,conversations:conversations.length,branchingCases:branchingCases.length,experiments:experiments.length,questions:academyQuestions.length,flashcards:revisionCards.length,glossary:glossary.length,toolkit:toolkit.length,references:references.length,urlCheckedReferences:references.filter(r=>r.verification==='URL reachable').length,brokenInternalLinks:links.length,validationErrors:errors.length};
 return {counts,errors};
}
export const targets={lessons:55,conversations:30,branchingCases:15,experiments:10,questions:100,flashcards:100,glossary:100,toolkit:30};
