from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA


def load_chain(workspace):

    db = Chroma(
        persist_directory=f"storage/vector_db/{workspace}",
        embedding_function=HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5"
        )
    )

    retriever = db.as_retriever(search_kwargs={"k": 6})

    llm = Ollama(model="qwen2.5-coder:14b")

    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever
    )