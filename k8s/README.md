# Kubernetes Structure

This starter is Docker Compose-first. For Kubernetes, split each service into:

- `Deployment`
- `Service`
- `ConfigMap`
- `Secret`
- `HorizontalPodAutoscaler`
- `Ingress`

Recommended namespaces:

- `school-system`
- `school-observability`

Keep PostgreSQL, Kafka, and MinIO on managed services or Helm charts in production.

