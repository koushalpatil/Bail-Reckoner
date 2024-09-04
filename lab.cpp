#include <iostream>
#include <vector>
#include <map>
#include <queue>
#include <cmath>
#include <limits>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>

using namespace std;

struct Node {
    int id;
    int heuristic; // Heuristic value for A* search
    Node(int id, int heuristic) : id(id), heuristic(heuristic) {}
};

// Compare function for priority queue
struct Compare {
    bool operator()(pair<int, Node*> a, pair<int, Node*> b) {
        return a.first > b.first;
    }
};

// A* algorithm
vector<int> aStar(int startId, int goalId, const map<int, vector<pair<Node*, int>>>& graph) {
    priority_queue<pair<int, Node*>, vector<pair<int, Node*>>, Compare> openSet;
    unordered_map<int, int> gCost; // Cost from start to node
    unordered_map<int, int> cameFrom; // To reconstruct the path

    // Retrieve start and goal nodes
    Node* start = nullptr;
    Node* goal = nullptr;

    for (const auto& entry : graph) {
        if (entry.first == startId) start = new Node(entry.first, 0); // Heuristic value for start
        if (entry.first == goalId) goal = new Node(entry.first, 0); // Heuristic value for goal
    }

    if (!start || !goal) {
        cerr << "Start or goal node not found in the graph.\n";
        return {};
    }

    gCost[start->id] = 0;
    openSet.push({start->heuristic, start});

    while (!openSet.empty()) {
        Node* current = openSet.top().second;
        openSet.pop();

        if (current->id == goal->id) {
            // Reconstruct path
            vector<int> path;
            int nodeId = goal->id;
            while (cameFrom.find(nodeId) != cameFrom.end()) {
                path.push_back(nodeId);
                nodeId = cameFrom[nodeId];
            }
            path.push_back(start->id);
            reverse(path.begin(), path.end());
            delete start;
            delete goal;
            return path;
        }

        for (const auto& neighborPair : graph.at(current->id)) {
            Node* neighbor = neighborPair.first;
            int cost = neighborPair.second;

            int tentativeGCost = gCost[current->id] + cost;
            if (gCost.find(neighbor->id) == gCost.end() || tentativeGCost < gCost[neighbor->id]) {
                gCost[neighbor->id] = tentativeGCost;
                int fCost = tentativeGCost + neighbor->heuristic;
                openSet.push({fCost, neighbor});
                cameFrom[neighbor->id] = current->id;
            }
        }
    }

    delete start;
    delete goal;
    return {}; // Return empty if no path is found
}

int main() {
    int numNodes, numEdges;
    
    cout << "Enter the number of nodes: ";
    cin >> numNodes;

    map<int, vector<pair<Node*, int>>> graph;
    unordered_map<int, int> heuristics;

    // Input heuristics for each node
    for (int i = 0; i < numNodes; ++i) {
        int nodeId, heuristic;
        cout << "Enter node ID and heuristic value: ";
        cin >> nodeId >> heuristic;
        heuristics[nodeId] = heuristic;
    }

    cout << "Enter the number of edges: ";
    cin >> numEdges;

    // Input edges
    for (int i = 0; i < numEdges; ++i) {
        int fromId, toId, cost;
        cout << "Enter edge (fromId toId cost): ";
        cin >> fromId >> toId >> cost;

        Node* toNode = new Node(toId, heuristics[toId]);
        if (graph.find(fromId) == graph.end()) {
            graph[fromId] = vector<pair<Node*, int>>();
        }
        graph[fromId].push_back({toNode, cost});
    }

    int startId, goalId;
    cout << "Enter start node ID: ";
    cin >> startId;
    cout << "Enter goal node ID: ";
    cin >> goalId;

    // Perform A* search
    vector<int> path = aStar(startId, goalId, graph);

    // Print the path
    if (!path.empty()) {
        cout << "Path found:\n";
        for (int nodeId : path) {
            cout << nodeId << " ";
        }
        cout << endl;
    } else {
        cout << "No path found.\n";
    }

    // Clean up dynamically allocated nodes
    for (auto& entry : graph) {
        for (auto& neighbor : entry.second) {
            delete neighbor.first;
        }
    }

    return 0;
}
