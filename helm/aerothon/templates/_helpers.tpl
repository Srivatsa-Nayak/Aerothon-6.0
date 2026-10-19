{{- define "aerothon.fullname" -}}
{{- if contains .Chart.Name .Release.Name -}}
{{- .Release.Name | trunc 50 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 50 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "aerothon.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: {{ .Chart.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Selector labels for one component: include "aerothon.selector" (list . "backend") */}}
{{- define "aerothon.selector" -}}
{{- $ := index . 0 -}}
app.kubernetes.io/name: {{ index . 1 }}
app.kubernetes.io/instance: {{ $.Release.Name }}
{{- end -}}

{{/* Image reference for one component: include "aerothon.image" (list . "backend") */}}
{{- define "aerothon.image" -}}
{{- $ := index . 0 -}}
{{- printf "%s:%s-%s" $.Values.image.repository (index . 1) (default $.Chart.AppVersion $.Values.image.tag) -}}
{{- end -}}
