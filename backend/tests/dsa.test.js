// ─── DSA Unit Tests for JobPulse ──────────────────────────────────────────────

// ─── Rabin-Karp String Matching ───────────────────────────────────────────────
const BASE = 31;
const MOD = 1e9 + 7;

function rabinKarpSearch(text, pattern) {
  const t = text.toLowerCase();
  const p = pattern.toLowerCase();
  const n = t.length, m = p.length;
  if (m > n) return false;

  let patHash = 0, winHash = 0, power = 1;

  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + p.charCodeAt(i)) % MOD;
    winHash = (winHash * BASE + t.charCodeAt(i)) % MOD;
    if (i > 0) power = (power * BASE) % MOD;
  }

  if (patHash === winHash && t.slice(0, m) === p) return true;

  for (let i = 1; i <= n - m; i++) {
    winHash = (winHash - t.charCodeAt(i - 1) * power % MOD + MOD) % MOD;
    winHash = (winHash * BASE + t.charCodeAt(i + m - 1)) % MOD;
    if (winHash === patHash && t.slice(i, i + m) === p) return true;
  }
  return false;
}

// ─── Min-Heap ─────────────────────────────────────────────────────────────────
class MinHeap {
  constructor() { this.heap = []; }
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }
  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].score < this.heap[smallest].score) smallest = l;
      if (r < n && this.heap[r].score < this.heap[smallest].score) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
  getTopN(n) {
    const all = [];
    const copy = new MinHeap();
    copy.heap = [...this.heap];
    while (copy.heap.length > 0) all.push(copy.pop());
    return all.sort((a, b) => b.score - a.score).slice(0, n);
  }
  size() { return this.heap.length; }
}

// ─── Diff Engine ──────────────────────────────────────────────────────────────
function diffJobs(existingUrls, newJobs) {
  const existingSet = new Set(existingUrls);
  return newJobs.filter(job => !existingSet.has(job.url));
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Rabin-Karp String Matching', () => {
  test('finds exact skill match in resume text', () => {
    const resume = 'Experienced with Node.js and PostgreSQL databases';
    expect(rabinKarpSearch(resume, 'Node.js')).toBe(true);
  });

  test('returns false when skill is not in resume', () => {
    const resume = 'Experienced with Python and Django';
    expect(rabinKarpSearch(resume, 'Node.js')).toBe(false);
  });

  test('is case insensitive', () => {
    const resume = 'Proficient in REACT and typescript';
    expect(rabinKarpSearch(resume, 'React')).toBe(true);
    expect(rabinKarpSearch(resume, 'TypeScript')).toBe(true);
  });

  test('returns false when pattern is longer than text', () => {
    expect(rabinKarpSearch('Go', 'PostgreSQL')).toBe(false);
  });

  test('finds skill at the start of resume', () => {
    const resume = 'Docker and Kubernetes experience';
    expect(rabinKarpSearch(resume, 'Docker')).toBe(true);
  });

  test('finds skill at the end of resume', () => {
    const resume = 'Experience with distributed systems and Kafka';
    expect(rabinKarpSearch(resume, 'Kafka')).toBe(true);
  });
});

describe('Min-Heap Job Ranking', () => {
  test('returns minimum score at top of heap', () => {
    const heap = new MinHeap();
    heap.push({ score: 75, title: 'SWE' });
    heap.push({ score: 45, title: 'PM' });
    heap.push({ score: 90, title: 'ML Engineer' });
    expect(heap.pop().score).toBe(45);
  });

  test('getTopN returns top N highest scores', () => {
    const heap = new MinHeap();
    heap.push({ score: 60, title: 'A' });
    heap.push({ score: 85, title: 'B' });
    heap.push({ score: 72, title: 'C' });
    heap.push({ score: 91, title: 'D' });
    heap.push({ score: 55, title: 'E' });
    const top3 = heap.getTopN(3);
    const scores = top3.map(j => j.score).sort((a, b) => b - a);
    expect(scores).toEqual([91, 85, 72]);
  });

  test('handles single item heap', () => {
    const heap = new MinHeap();
    heap.push({ score: 80, title: 'Solo' });
    expect(heap.pop().score).toBe(80);
    expect(heap.size()).toBe(0);
  });

  test('maintains heap property after multiple pushes', () => {
    const heap = new MinHeap();
    [30, 10, 50, 20, 40].forEach(score => heap.push({ score, title: `Job${score}` }));
    const sorted = [];
    while (heap.size() > 0) sorted.push(heap.pop().score);
    expect(sorted).toEqual([10, 20, 30, 40, 50]);
  });
});

describe('Diff Engine — New Job Detection', () => {
  test('detects new jobs not in existing set', () => {
    const existing = ['https://google.com/job/1', 'https://google.com/job/2'];
    const newJobs = [
      { url: 'https://google.com/job/1', title: 'SWE' },
      { url: 'https://google.com/job/3', title: 'ML Engineer' },
    ];
    const result = diffJobs(existing, newJobs);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('ML Engineer');
  });

  test('returns empty array when no new jobs', () => {
    const existing = ['https://google.com/job/1'];
    const newJobs = [{ url: 'https://google.com/job/1', title: 'SWE' }];
    expect(diffJobs(existing, newJobs)).toHaveLength(0);
  });

  test('returns all jobs when existing set is empty', () => {
    const newJobs = [
      { url: 'https://google.com/job/1', title: 'SWE' },
      { url: 'https://google.com/job/2', title: 'PM' },
    ];
    expect(diffJobs([], newJobs)).toHaveLength(2);
  });

  test('handles large job sets efficiently', () => {
    const existing = Array.from({ length: 1000 }, (_, i) => `https://google.com/job/${i}`);
    const newJobs = [
      ...Array.from({ length: 1000 }, (_, i) => ({ url: `https://google.com/job/${i}`, title: 'Old' })),
      { url: 'https://google.com/job/new', title: 'Brand New Job' }
    ];
    const result = diffJobs(existing, newJobs);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Brand New Job');
  });
});