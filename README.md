repair-node
===========

Academic attempt at Repair algorithm

The goal of this algorithm is to process a file of words (represented by or converted uniquely into integers), and to find the most common occurring pairs of words and phrases, in order to partition the document for more efficient indexing with multiple versions. 

Currently, this code can process an array of ints, Ex: [2,5,6,4,3,7,1,4] and build the replacement pair table which can be used to construct a tree for partitioning. It can also reverse a pair table back into the original document (in order to verify correctness). 

Notes: 
1. The most inefficient part is currently the pair scan, particularly the indexSearch() function, which iterates through an array of pair objects, already inside of a for loop making it grow exponentially. Need to implement a faster lookup.