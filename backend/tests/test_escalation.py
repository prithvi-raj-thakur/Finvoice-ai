import pytest
from livekit.agents import AgentSession, inference, llm

from agent import Assistant


def _llm() -> llm.LLM:
    return inference.LLM(model="openai/gpt-4.1-mini")

@pytest.mark.asyncio
async def test_fraud_consent() -> None:
    async with (
        _llm() as llm_instance,
        AgentSession(llm=llm_instance) as session,
    ):
        await session.start(Assistant())
        result = await session.run(user_input="I think someone made a transaction using my account.")
        await (
            result.expect.next_event()
            .is_message(role="assistant")
            .judge(
                llm_instance,
                intent="Explains human escalation and asks permission to share a summary.",
            )
        )
        # Assuming the agent asked for permission
        result2 = await session.run(user_input="Yes, please create the request.")

        # It should call create_escalation
        event = await result2.expect.next_event()
        assert event.type == "function_call", "Agent should call a tool"
        assert event.function_call.name == "create_escalation"

        # We can also check that after tool returns, it gives reference ID
        result2.expect.no_more_events()

@pytest.mark.asyncio
async def test_fraud_no_consent() -> None:
    async with (
        _llm() as llm_instance,
        AgentSession(llm=llm_instance) as session,
    ):
        await session.start(Assistant())
        result = await session.run(user_input="I think someone made a transaction using my account.")

        result2 = await session.run(user_input="No, don't send it.")

        # Agent respects decision
        await (
            result2.expect.next_event()
            .is_message(role="assistant")
            .judge(
                llm_instance,
                intent="Respects the decision not to escalate.",
            )
        )
        result2.expect.no_more_events()

@pytest.mark.asyncio
async def test_normal_question() -> None:
    async with (
        _llm() as llm_instance,
        AgentSession(llm=llm_instance) as session,
    ):
        await session.start(Assistant())
        result = await session.run(user_input="Can you explain this government scheme?")
        await (
            result.expect.next_event()
            .is_message(role="assistant")
            .judge(
                llm_instance,
                intent="Explains the scheme without trying to escalate.",
            )
        )
        result.expect.no_more_events()
