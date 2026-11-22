export interface SampleProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  javaCode: string;
  pythonCode: string;
}

export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    id: 'stream-filter-map',
    title: 'Stream Transformation & Null Filtering',
    category: 'Functional & Collections',
    description: 'Filters numbers above a threshold, scales them, and guards against null references.',
    javaCode: `import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ScoreProcessor {
    public static List<Integer> filterAndDoubleScores(List<Integer> rawScores, int threshold) {
        if (rawScores == null) {
            return new ArrayList<>();
        }
        return rawScores.stream()
                        .filter(score -> score != null && score >= threshold)
                        .map(score -> score * 2)
                        .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        List<Integer> scores = List.of(45, 80, 92, 10, 65);
        List<Integer> result = filterAndDoubleScores(scores, 50);
        System.out.println("Transformed: " + result);
    }
}`,
    pythonCode: `from typing import List, Optional

class ScoreProcessor:
    @staticmethod
    def filter_and_double_scores(
        raw_scores: Optional[List[Optional[int]]], 
        threshold: int
    ) -> List[int]:
        """Filters scores above threshold and doubles them, guarding against None."""
        if raw_scores is None:
            return []
        return [
            score * 2 
            for score in raw_scores 
            if score is not None and score >= threshold
        ]

if __name__ == "__main__":
    scores = [45, 80, 92, 10, 65]
    result = ScoreProcessor.filter_and_double_scores(scores, 50)
    print(f"Transformed: {result}")
`,
  },
  {
    id: 'frequency-counter',
    title: 'Frequency Counter with Exception Boundary',
    category: 'Map / Dict & Error Invariants',
    description: 'Counts token occurrences using maps/dictionaries with input validation and empty token guards.',
    javaCode: `import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WordFrequencyAnalyzer {
    public static Map<String, Integer> calculateFrequencies(List<String> words) {
        if (words == null) {
            throw new IllegalArgumentException("Word list cannot be null.");
        }
        Map<String, Integer> frequencies = new HashMap<>();
        for (String word : words) {
            if (word == null || word.isBlank()) {
                continue;
            }
            String normalized = word.trim().toLowerCase();
            frequencies.put(normalized, frequencies.getOrDefault(normalized, 0) + 1);
        }
        return frequencies;
    }
}`,
    pythonCode: `from collections import defaultdict
from typing import Dict, List, Optional

class WordFrequencyAnalyzer:
    @staticmethod
    def calculate_frequencies(words: Optional[List[Optional[str]]]) -> Dict[str, int]:
        """Calculates token frequencies with validation and case normalization."""
        if words is None:
            raise ValueError("Word list cannot be null.")
        
        frequencies = defaultdict(int)
        for word in words:
            if not word or not word.strip():
                continue
            normalized = word.strip().lower()
            frequencies[normalized] += 1
            
        return dict(frequencies)
`,
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Design (OOP Hierarchy)',
    category: 'Data Structures & State Mutability',
    description: 'Implements Least Recently Used eviction policy using doubly-linked nodes and hash mapping.',
    javaCode: `import java.util.HashMap;
import java.util.Map;

public class LRUCache {
    static class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }

    private final int capacity;
    private final Map<Integer, Node> map;
    private final Node head, tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();
        this.head = new Node(0, 0);
        this.tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insert(node);
        return node.value;
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insert(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}`,
    pythonCode: `from typing import Dict, Optional

class Node:
    def __init__(self, key: int, value: int):
        self.key: int = key
        self.value: int = value
        self.prev: Optional['Node'] = None
        self.next: Optional['Node'] = None

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity: int = capacity
        self.map: Dict[int, Node] = {}
        self.head: Node = Node(0, 0)
        self.tail: Node = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._insert(node)
        return node.value

    def _remove(self, node: Node) -> None:
        node.prev.next = node.next  # type: ignore
        node.next.prev = node.prev  # type: ignore

    def _insert(self, node: Node) -> None:
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node  # type: ignore
        self.head.next = node
`,
  },
];
