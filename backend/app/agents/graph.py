from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.nodes.creator import creator_node
from app.nodes.critic import critic_node
from app.nodes.control import control_node, should_continue


def build_prompt_graph():
    graph = StateGraph(AgentState)

    graph.add_node("creator", creator_node)
    graph.add_node("critic", critic_node)
    graph.add_node("control", control_node)

    graph.set_entry_point("creator")

    graph.add_edge("creator", "critic")
    graph.add_edge("critic", "control")

    graph.add_conditional_edges(
        "control",
        should_continue,
        {
            "creator": "creator",
            "end": END,
        },
    )

    return graph.compile()
