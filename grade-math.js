/* Deadline 2.0: pure, separately testable weighted-grade calculations. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GradeCalcMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function compute(course) {
    const items = course.assessments;
    const target = course.target;
    const weight = items.reduce((n, x) => n + x.weight, 0);
    const known = items.filter(x => x.score !== null);
    const pending = items.filter(x => x.score === null);
    const knownWeight = known.reduce((n, x) => n + x.weight, 0);
    const weightedPoints = known.reduce((n, x) => n + x.score * x.weight / 100, 0);
    const gradedAverage = knownWeight ? weightedPoints * 100 / knownWeight : null;
    const maxPossible = weightedPoints + pending.reduce((n,x) => n+x.weight,0);
    const base = {weight,knownWeight,weightedPoints,gradedAverage,maxPossible,pending, target, finalGrade: null, required: null, state:'incomplete'};
    // A course grade is only defined when its components sum to exactly 100%.
    if (Math.abs(weight - 100) > 1e-7) return {...base, state:weight>100?'overweight':'underweight'};
    if (!pending.length) return {...base,finalGrade:weightedPoints,state:'complete'};
    if (pending.length !== 1 || pending[0].kind !== 'exam') return {...base,state:'multiple-pending'};
    const exam = pending[0];
    const rawRequired = (target - weightedPoints) * 100 / exam.weight;
    // Round upwards to one decimal to avoid promising a target below the required threshold.
    const displayRequired = Math.max(0,Math.ceil((rawRequired - 1e-9)*10)/10);
    return {...base,exam,required:rawRequired,displayRequired,state:rawRequired>100+1e-9?'impossible':rawRequired<=0?'secured':'required'};
  }
  return {compute};
});