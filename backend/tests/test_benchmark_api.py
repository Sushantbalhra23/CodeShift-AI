import pytest


@pytest.mark.asyncio
async def test_benchmark_endpoints(client):
    # 1. First perform a translation to seed data
    payload = {
        "source_code": "public class Hello { public static void say() { System.out.println(\"Hi\"); } }",
        "source_language": "java",
        "target_language": "python",
        "strategy": "zero_shot",
    }
    trans_resp = await client.post("/api/v1/translate", json=payload)
    assert trans_resp.status_code == 200

    # 2. Get history
    history_resp = await client.get("/api/v1/benchmark/history")
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert len(history) >= 1
    assert history[0]["metadata"]["strategy"] == "zero_shot"

    # 3. Get stats
    stats_resp = await client.get("/api/v1/benchmark/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_experiments"] >= 1
    assert len(stats["strategies"]) >= 1
