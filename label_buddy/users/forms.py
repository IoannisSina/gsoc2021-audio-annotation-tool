from allauth.account.forms import SignupForm
from django import forms 
from .models import User

class ExtendedSignUpForm(SignupForm):
    name = forms.CharField(max_length=256)

    def __init__(self, *args, **kwargs):
        # Call the init of the parent class
        super().__init__(*args, **kwargs)
        self.fields["name"].widget.attrs = {'placeholder': 'E.g. "John Anderson"', 'autocomplete': "name"}
        self.fields["name"].label = "First & Last Name"

        self.fields["email"].widget.attrs = {'placeholder': "E.g. JohnAnderson@mars.co", 'autocomplete': "email"}
        self.fields["email"].label = "Email Address"

        self.fields["username"].widget.attrs = {'placeholder': "E.g. johnanderson", 'autocomplete': "username"}

        self.fields["password1"].widget.attrs = {'placeholder': "Enter new password", 'autocomplete': "new-password"}
    def save(self, request):
        user = super(ExtendedSignUpForm, self).save(request)
        user.name = self.cleaned_data["name"]
        user.save()
        return user

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            "name",
            "email",
            "phone_number",
            "avatar",
        ]
        labels = {
            'name': '<b>Name:</b>',
            'email': '<b>Email:</b>',
            'phone_number': '<b>Phone number:</b>',
            'avatar': '<b>Avatar:</b>',
        }

    
    def clean_avatar(self):
        image = self.cleaned_data.get("avatar", False)
        if image:
            if image.size > 2 * 1024 * 1024:
                raise forms.ValidationError("Image file too large ( > 2mb )")
            return image
        else:
            raise forms.ValidationError("Please provide a logo")

    def clean_email(self):
        # when field is cleaned, we always return the existing model field.
        return self.instance.email