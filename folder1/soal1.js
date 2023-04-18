function countSubarraysWithSumK(a, m, k) {
  let count = 0; // Initialize the count to 0
  let sum = 0; // Initialize the sum of subarray to 0
  let hashMap = new Map(); // Create a HashMap to store frequency of sums

  for (let i = 0; i < a.length; i++) {
    // Add current element to sum
    sum += a[i];

    // If current sum is equal to target sum k, increment count
    if (sum === k) {
      count++;
    }

    // If (sum - k) is already present in the hashMap,
    // increment count by the frequency of (sum - k)
    if (hashMap.has(sum - k)) {
      count += hashMap.get(sum - k);
    }

    // If subarray length is greater than m, remove the leftmost element from sum
    if (i >= i - m) {
      sum -= a[i - m];
    }

    // Update the frequency of current sum in the hashMap
    if (hashMap.has(sum)) {
      hashMap.set(sum, hashMap.get(sum) + 1);
    } else {
      hashMap.set(sum, 1);
    }
  }

  return count;
}
