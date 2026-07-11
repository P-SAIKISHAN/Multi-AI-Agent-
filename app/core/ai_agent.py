from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults

from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage

from app.config.settings import settings

def get_response_from_ai_agents(llm_id , query , allow_search ,system_prompt):

    llm = ChatGroq(model=llm_id)

    tools = [TavilySearchResults(max_results=2)] if allow_search else []

    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=system_prompt
    )

    # Convert query list of strings to proper message objects
    formatted_messages = []
    for idx, msg in enumerate(query):
        if idx % 2 == 0:
            formatted_messages.append(HumanMessage(content=msg))
        else:
            formatted_messages.append(AIMessage(content=msg))

    state = {"messages" : formatted_messages}

    response = agent.invoke(state)

    messages = response.get("messages")

    ai_messages = [message.content for message in messages if isinstance(message,AIMessage)]

    return ai_messages[-1]






