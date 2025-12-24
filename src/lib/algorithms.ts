export function quickSelect(arr: number[], k: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (true) {
    if (left === right) return arr[left];

    const pivotIndex = partition(arr, left, right);

    if (k === pivotIndex) return arr[k];
    if (k < pivotIndex) right = pivotIndex - 1;
    else left = pivotIndex + 1;
  }
}

export function partition(arr: number[], left: number, right: number): number {
  const pivot = arr[right];
  let i = left;

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }

  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

export function getPercentile(values: number[], percentile = 60): number {
  const n = values.length;
  if (n === 0) return 0;

  const k = Math.floor((percentile / 100) * (n - 1));
  const arr = values.slice();

  return quickSelect(arr, k);
}
