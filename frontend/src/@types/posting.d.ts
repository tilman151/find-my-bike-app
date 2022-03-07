export interface IPosting {
  title: string;
  url: string;
  img_url: boolean;
  prediction: IPredictions;
}

export interface IPredictions {
  bike: string;
  frame: string;
  color: string;
}

export type PostingsContextType = {
  postings: ITodo[];
  fetchPostings: (query: PostingQueryType) => {};
};

export type PostingQueryType = {
  bike: str;
  frame: str;
  color: str;
}