import shutil
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from workspace_service import get_paths


def index_workspace(workspace):

    paths = get_paths(workspace)
    db_path = f"storage/vector_db/{workspace}"

    shutil.rmtree(db_path, ignore_errors=True)

    docs = []

    for p in paths:
        loader = DirectoryLoader(p, glob="**/*.*", use_multithreading=True)
        docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(docs)

    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    db = Chroma.from_documents(
        chunks,
        embedding=embeddings,
        persist_directory=db_path
    )

    db.persist()

    return {"status": "indexed"}