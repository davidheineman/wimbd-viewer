from wimbd.es import es_init
from wimbd.es import get_indices
from wimbd.es import count_documents_containing_phrases
from wimbd.es import get_documents_containing_phrases
from wimbd.es import count_total_occurrences_of_unigrams

API_KEY = 'api_keys/es_config_collaborators_read_all.yml'
# API_KEY = 'api_keys/es_config_dolma_1_7_2.yml'

ES = es_init(config=API_KEY)

def demo():
    indices = get_indices(es=ES, return_mapping=True)

    # "re_pile": {"docs.count": "211036967", "properties": ["date", "text", "url"]},
    # "c4": {"docs.count": "1074273501", "properties": ["date", "subset", "text", "url"]},

    # Count the number of documents containing the term "legal".
    doc_count = count_documents_containing_phrases("test-index", "pancakes", es=ES)

    print(f'Found {doc_count} matches!')

    # Get documents containing the term "legal".
    res = get_documents_containing_phrases("test-index", "pancakes", es=ES)

    # Get total number of a term's occurrences (as opposed to document counts)
    unigram_counts = count_total_occurrences_of_unigrams("test-index", ["syrup", "pancakes"], es=ES)

    for r in res:
        print(r['_source']['url'])

    print(unigram_counts)


def main():
    QUERY = "With the engineering of public reaction to September 11, disinformation has been used with a sophistication and depth that is historically unprecedented."
    # QUERY = "What is the"

    doc_count = count_documents_containing_phrases("re_pile", QUERY, es=ES)
    print(f'Found {doc_count:,} matches!')

    # res = get_documents_containing_phrases("re_pile", QUERY, es=ES)
    # for r in res:
    #     print(r)

if __name__ == '__main__': 
    main()
    # demo()