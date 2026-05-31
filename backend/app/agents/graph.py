from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.nodes.orchestrator import orchestrator_node, route_action
from app.nodes.creator import creator_node
from app.nodes.tester import tester_node
from app.nodes.asserts import assertion_node
from app.nodes.critic import critic_node
from app.nodes.control import control_node


def build_prompt_graph():
    graph = StateGraph(AgentState)

    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("creator", creator_node)
    graph.add_node("tester", tester_node)
    graph.add_node("asserts", assertion_node)
    graph.add_node("critic", critic_node)
    graph.add_node("control", control_node)

    # The orchestrator decides; a "refine" runs the evidence cycle, which loops back.
    graph.set_entry_point("orchestrator")
    graph.add_conditional_edges("orchestrator", route_action, {"creator": "creator", "end": END})
    graph.add_edge("creator", "tester")
    graph.add_edge("tester", "asserts")
    graph.add_edge("asserts", "critic")
    graph.add_edge("critic", "control")
    graph.add_edge("control", "orchestrator")

    return graph.compile()
